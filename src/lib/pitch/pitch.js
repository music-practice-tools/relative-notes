import { PitchDetector } from 'pitchy'
import { median } from './stats.js'

// The worklet lives in /static and is served at the site root. It must be a
// real http(s) URL — AudioWorklet.addModule rejects blob/data URLs in some
// browsers (notably Firefox), which silently yields no audio frames.
const WORKLET_URL = '/pitch-worklet.js'

/** Root-mean-square amplitude of an audio block (0–1 for float samples). */
function computeRms(block) {
  let sum = 0
  for (let i = 0; i < block.length; i++) sum += block[i] * block[i]
  return Math.sqrt(sum / block.length)
}

export class LiveMicPitchTracker {
  constructor(options = {}) {
    // Longer window = more periods for low notes to correlate against (bass-friendly),
    // at the cost of latency (~186 ms at 44.1 kHz vs ~93 ms at 4096).
    this.windowSize = options.windowSize ?? 8192 // passed to the worklet via processorOptions
    // Our gate on pitchy's clarity output (not pitchy's own MPM clarity threshold).
    // Bass fundamentals are inherently weak, so clarity often runs well below
    // pitchy's "distinct" range; 0.7 to *start* keeps noise out without missing
    // quiet notes.
    this.clarityThreshold = options.clarityThreshold ?? 0.7
    // Once tracking, stay very tolerant of clarity dips (hysteresis): the pitch
    // is already octave-corrected + median-smoothed, so low clarity is mostly a
    // symptom of a weak fundamental rather than a wrong pitch.
    this.releaseThreshold = options.releaseThreshold ?? 0.4
    // Detection range A2–C6 (MIDI 45–84, ≈110–1046.5 Hz). This spans the full
    // melodic vocal fundamental range — from a low bass A2 to soprano high C6 —
    // and sits well above mains hum (≈ G1/B1).
    this.minFrequency = options.minFrequency ?? 65
    this.maxFrequency = options.maxFrequency ?? 1046.5
    // Minimum RMS loudness before a frame counts as "voiced" (≈ −63 dBFS).
    // Tune this between the room's silence level and the singer's quietest note.
    this.minRms = options.minRms ?? 0.0007
    // Median window (frames) used to smooth the folded pitch in filterPitch.
    this.medianWindow = options.medianWindow ?? 5

    this.audioContext = null
    this.micStream = null
    this.workletNode = null
    this.detector = PitchDetector.forFloat32Array(this.windowSize)
    // pitchy's internal peak-selection threshold (the MPM "k" constant).
    // Higher k = pick only the strongest peak (avoids the octave-up "harmonic"
    // error on bass); lower k = accept a weaker earlier peak (avoids the
    // octave-down "subharmonic" error). Tune per voice.
    this.detector.clarityThreshold = options.mpmThreshold ?? 0.9
    this.pitchHistory = []
    this.referenceSeeds = []
    this.referencePitch = null
    this.voiced = false
    this.isTracking = false
    this.startGeneration = 0
  }

  /** Starts capturing live microphone input and running pitch detection. */
  async start(onPitch) {
    if (this.isTracking) return

    // Invalidate any in-flight start() when a new one begins.
    const generation = ++this.startGeneration
    this.isTracking = true

    // Session-local resources so an overlapping, stale session can never clobber
    // the current session's shared `this.*` state. They are only committed to the
    // instance once fully set up.
    let audioContext = null
    let micStream = null
    let workletNode = null

    const teardownSession = () => {
      if (workletNode) {
        workletNode.disconnect()
        workletNode = null
      }
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop())
        micStream = null
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {})
      }
      audioContext = null
    }

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      await audioContext.resume()

      // If stop() ran while we were resuming, bail out before prompting for mic.
      if (generation !== this.startGeneration || !this.isTracking) {
        teardownSession()
        return
      }

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Turn off DSP processing for raw singing tone
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      if (generation !== this.startGeneration || !this.isTracking) {
        teardownSession()
        return
      }

      await audioContext.audioWorklet.addModule(WORKLET_URL)

      // If stop() ran while the worklet module was loading, bail out.
      if (generation !== this.startGeneration || !this.isTracking) {
        teardownSession()
        return
      }

      const source = audioContext.createMediaStreamSource(micStream)
      workletNode = new AudioWorkletNode(audioContext, 'pitch-capture', {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
        channelCountMode: 'explicit',
        processorOptions: { windowSize: this.windowSize },
      })
      source.connect(workletNode)

      workletNode.port.onmessage = (event) => {
        // Drop frames queued by a superseded session (e.g. posted just before
        // stop()), not merely the global tracking flag.
        if (generation !== this.startGeneration || !this.isTracking) return

        const block = event.data
        const [pitch, clarity] = this.detector.findPitch(
          block,
          audioContext.sampleRate,
        )
        const rms = computeRms(block)
        onPitch(this.filterPitch(pitch, clarity, rms))
      }

      // Commit this session's resources so stop() can release them.
      this.audioContext = audioContext
      this.micStream = micStream
      this.workletNode = workletNode
    } catch (error) {
      // Release whatever this session managed to acquire.
      teardownSession()

      // A stale session's error must not disturb a newer session's state.
      if (generation === this.startGeneration) {
        this.isTracking = false
        console.error('Pitch tracker failed to start:', error)
        throw error
      }
    }
  }

  /** Stops the microphone stream and releases hardware. */
  stop() {
    this.isTracking = false
    this.startGeneration++ // invalidate any in-flight start()
    this.cleanup()
  }

  /** Releases mic and audio resources for the committed session. */
  cleanup() {
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop())
      this.micStream = null
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {})
    }
    this.audioContext = null
    this.pitchHistory.length = 0
    this.referenceSeeds.length = 0
    this.referencePitch = null
    this.voiced = false
  }

  /**
   * Gates, octave-corrects and stabilizes a raw pitch estimate before handing
   * it off. Returns `{ pitch, clarity, rawFrequency, rms, rejectReason }`:
   * - `pitch` is the gated, folded, median-smoothed frequency (Hz) or null if rejected.
   * - `clarity` is pitchy's raw 0–1 confidence.
   * - `rawFrequency` is pitchy's ungated estimate (Hz), kept even on rejection so
   *   diagnostics can show what a discarded frame actually scored.
   * - `rms` is the block's loudness (0–1), surfaced for diagnostics.
   * - `rejectReason` is null when accepted, otherwise 'silence' | 'none' |
   *   'clarity' | 'range'.
   */
  filterPitch(pitch, clarity, rms = 0) {
    const rawFrequency = pitch

    // Gate on loudness first: silence/room noise produces clarity that jumps all
    // over the place, so amplitude is a far more reliable "is anyone singing?"
    // signal than clarity.
    if (rms < this.minRms) {
      this.pitchHistory.length = 0
      this.referenceSeeds.length = 0
      this.referencePitch = null
      this.voiced = false
      return {
        pitch: null,
        clarity,
        rawFrequency,
        rms,
        rejectReason: 'silence',
      }
    }

    // No usable estimate at all (noise).
    if (!pitch) {
      this.pitchHistory.length = 0
      this.referenceSeeds.length = 0
      this.referencePitch = null
      this.voiced = false
      return { pitch: null, clarity, rawFrequency, rms, rejectReason: 'none' }
    }

    // Clarity is pitchy's built-in confidence measure (0–1); low values mean noise.
    // Hysteresis: a stricter threshold to *start* a note and a looser one to
    // *stay*, so a note doesn't flap on/off when clarity hovers near the boundary.
    const gate = this.voiced ? this.releaseThreshold : this.clarityThreshold
    if (clarity < gate) {
      this.pitchHistory.length = 0
      this.voiced = false
      return {
        pitch: null,
        clarity,
        rawFrequency,
        rms,
        rejectReason: 'clarity',
      }
    }
    this.voiced = true

    // Reject raw estimates outside range *before* folding, so out-of-range
    // garbage can neither seed nor corrupt the octave reference. Unlike the
    // silence/none/clarity rejections above, the running reference and the
    // `voiced` hysteresis are intentionally left intact here: an out-of-range
    // frame is usually a stray harmonic, and resetting the reference would
    // force the next good frame to re-seed from a cold start.
    if (pitch < this.minFrequency || pitch > this.maxFrequency) {
      return { pitch: null, clarity, rawFrequency, rms, rejectReason: 'range' }
    }

    // Octave-fold toward the running reference: pitchy often reports a harmonic
    // (2×) or subharmonic (½×) when a note's fundamental is weak (common on
    // bass). Folding maps those back onto the same pitch class before voting.
    // The reference is seeded from a short consensus of raw frames so a lone
    // harmonic at note onset can't lock the octave in the wrong place.
    let folded
    if (this.referencePitch == null) {
      this.referenceSeeds.push(pitch)
      folded = pitch
      if (this.referenceSeeds.length >= 3) {
        this.referencePitch = median(this.referenceSeeds)
        this.referenceSeeds.length = 0
      }
    } else {
      folded = this._foldToOctave(pitch, this.referencePitch)
    }

    // Median filter smooths remaining jitter.
    this.pitchHistory.push(folded)
    if (this.pitchHistory.length > this.medianWindow) this.pitchHistory.shift()

    const medianPitch = median(this.pitchHistory)
    if (this.referencePitch != null) this.referencePitch = medianPitch

    return {
      pitch: medianPitch,
      clarity,
      rawFrequency,
      rms,
      rejectReason: null,
    }
  }

  /**
   * Folds `pitch` into the octave band within ±6 semitones (a factor of √2) of
   * `reference`, returning the octave-equivalent closest to the reference. This
   * corrects octave errors while leaving genuine note moves ≤ a tritone intact.
   */
  _foldToOctave(pitch, reference) {
    while (pitch > reference * Math.SQRT2) pitch /= 2
    while (pitch < reference / Math.SQRT2) pitch *= 2
    return pitch
  }
}


