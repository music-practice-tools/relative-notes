import { createNote, noteCallbacks, snapshotNote } from './note-events.js'
import { freqToMidi } from './notes.js'
import { median } from './stats.js'

/**
 * Turns a stream of `{ pitch, clarity }` frames into discrete, stable note
 * events. Sits downstream of `LiveMicPitchTracker.filterPitch`, so `pitch` is
 * already octave-folded + median-smoothed frequency in Hz (or null for
 * silence/noise) and `clarity` is pitchy's 0–1 confidence.
 *
 * A second, short median over fractional MIDI (see `update`) further
 * stabilizes note onsets and drift detection; note statistics (cents,
 * frequency, clarity) are accumulated from the per-frame `pitch`, so they
 * reflect the engine's output rather than this second smoothing pass.
 *
 * Pitch is compared in fractional-MIDI space (semitones), which is
 * octave-independent, so vibrato (tens of cents) and real note changes
 * (>= a semitone) are easy to tell apart.
 *
 * State machine:
 *   idle → attack → sustain → release → idle
 * with a drift check while sustaining so a note change *without* a pause is
 * also caught.
 */
export function createNoteTracker(options = {}) {
  const { onNoteStart, onNoteEnd, onNoteChange, now } = noteCallbacks(options)

  // How long a pitch must persist before a note is committed (rejects noise).
  const attackMs = options.attackMs ?? 150
  // How long silence must last before the current note is ended (handles pauses).
  // Generous so a note survives vocal dropouts mid-phrase without ending.
  const releaseMs = options.releaseMs ?? 900
  // Hysteresis for distinguishing vibrato/drift from an actual note change.
  const changeThresholdCents = options.changeThresholdCents ?? 50
  // How long the pitch must sit beyond that threshold before a new note fires.
  const changeMs = options.changeMs ?? 120
  // Median window over recent frames for stability.
  const medianWindow = options.medianWindow ?? 5
  const refA4 = options.refA4 ?? 440

  let state = 'idle'
  let sequence = 0
  let medianBuffer = []
  let current = null
  let stateSince = null
  let driftSince = null
  let releaseSince = null

  function reset() {
    state = 'idle'
    sequence = 0
    medianBuffer = []
    current = null
    stateSince = null
    driftSince = null
    releaseSince = null
  }

  /** Feed one detector frame. `pitch` is Hz (already engine-smoothed) or null; `clarity` is 0–1. */
  function update({ pitch, clarity }) {
    const t = now()

    if (pitch == null) {
      medianBuffer.length = 0
      onSilence(t)
      return
    }

    // frameMidi is the engine's folded + median-smoothed pitch, not the raw
    // detector output. The medianBuffer below is a second, short median that
    // only steadies note onsets/drift; note stats accumulate from frameMidi.
    const frameMidi = freqToMidi(pitch, refA4)
    medianBuffer.push(frameMidi)
    if (medianBuffer.length > medianWindow) medianBuffer.shift()

    const medianMidi = median(medianBuffer)
    onPitch(t, medianMidi, frameMidi, pitch, clarity)
  }

  /** Live snapshot of the in-progress note, or null when idle. */
  function getCurrentNote() {
    if (!current || state === 'attack') return null
    return startPayload(current)
  }

  function onSilence(t) {
    if (state === 'attack') {
      abortAttack()
      return
    }
    if (state === 'sustain') {
      state = 'release'
      releaseSince = t
      return
    }
    if (state === 'release' && t - releaseSince >= releaseMs) {
      endNote()
    }
  }

  function onPitch(t, medianMidi, frameMidi, freq, clarity) {
    if (state === 'idle') {
      state = 'attack'
      stateSince = t
      driftSince = null
      current = buildNote(t, medianMidi)
    }

    accumulate(current, frameMidi, freq, clarity)
    current.lastPitchTime = t

    if (state === 'attack') {
      current.referenceMidi = medianMidi
      if (t - stateSince >= attackMs) commit()
      return
    }

    if (state === 'sustain') {
      checkDrift(t, medianMidi)
      return
    }

    // release → the pitch returned before the release timer elapsed.
    state = 'sustain'
    driftSince = null
    checkDrift(t, medianMidi)
  }

  function checkDrift(t, medianMidi) {
    const driftCents = Math.abs(medianMidi - current.referenceMidi) * 100

    if (driftCents <= changeThresholdCents) {
      driftSince = null
      return
    }

    if (driftSince == null) {
      driftSince = t
      return
    }

    if (t - driftSince >= changeMs) {
      changeNote(t, medianMidi)
    }
  }

  function commit() {
    current.sequence = ++sequence
    state = 'sustain'
    driftSince = null
    onNoteStart(startPayload(current))
  }

  function abortAttack() {
    state = 'idle'
    current = null
    driftSince = null
  }

  function endNote() {
    onNoteEnd(endPayload(current))
    current = null
    state = 'idle'
    driftSince = null
  }

  function changeNote(t, medianMidi) {
    const prev = endPayload(current)
    onNoteEnd(prev)

    const next = buildNote(t, medianMidi)
    next.sequence = ++sequence
    current = next
    driftSince = null

    const nextStart = startPayload(next)
    onNoteStart(nextStart)
    onNoteChange(prev, nextStart)
  }

  function buildNote(t, midi) {
    return {
      ...createNote({ midi, startTime: t }),
      referenceMidi: midi,
      lastPitchTime: t,
      freqSum: 0,
      midiSum: 0,
      midiSqSum: 0,
      claritySum: 0,
      minClarityRaw: Infinity,
      maxClarityRaw: -Infinity,
    }
  }

  function accumulate(note, midi, freq, clarity) {
    note.freqSum += freq
    note.midiSum += midi
    note.midiSqSum += midi * midi
    note.claritySum += clarity
    if (clarity < note.minClarityRaw) note.minClarityRaw = clarity
    if (clarity > note.maxClarityRaw) note.maxClarityRaw = clarity
    note.frameCount += 1
  }

  function snapshot(note, final = false) {
    const payload = snapshotNote(note, { final })
    const frames = note.frameCount || 1
    const meanMidi = note.midiSum / frames
    const meanFreq = note.freqSum / frames
    const variance = Math.max(0, note.midiSqSum / frames - meanMidi * meanMidi)

    payload.cents = (meanMidi - note.midi) * 100
    payload.frequency = meanFreq
    payload.quality = note.claritySum / frames
    payload.minClarity =
      note.minClarityRaw === Infinity ? null : note.minClarityRaw
    payload.maxClarity =
      note.maxClarityRaw === -Infinity ? null : note.maxClarityRaw
    payload.stabilityCents = Math.sqrt(variance) * 100
    return payload
  }

  function startPayload(note) {
    return snapshot(note, false)
  }

  function endPayload(note) {
    return snapshot(note, true)
  }

  reset()
  return { reset, update, getCurrentNote }
}
