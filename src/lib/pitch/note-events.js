// Shared, framework-free note-event model. Every note source in this project —
// the live-mic path and the Web MIDI path — emits the same payloads through the
// same callbacks, so a UI can consume either (or both) without knowing which
// one produced a note.
//
// The payload is a superset. Audio-only fields (cents, frequency, quality,
// clarity, stability) are populated by the pitch path and stay null for
// MIDI-sourced notes; MIDI fields (velocity, channel) use typical defaults for
// audio-sourced notes and real values for Web MIDI notes. A consumer that only
// shows name/octave/timing can ignore every extra field.

import { midiToName, midiToOctave } from './notes.js'

/**
 * Builds a note object with every public field present. `midi` may be
 * fractional (the pitch path passes a fractional MIDI estimate); it is rounded
 * here for the public `midi`/`name`/`octave` fields. `velocity` defaults to
 * 100 and `channel` to 0 (zero-based, i.e. MIDI channel 1) so audio-sourced
 * notes still carry usable MIDI fields; the Web MIDI path overrides both.
 */
export function createNote({ midi, startTime, velocity = 100, channel = 0 }) {
  const rounded = Math.round(midi)
  return {
    midi: rounded,
    name: midiToName(rounded),
    octave: midiToOctave(rounded),
    startTime,
    endTime: null,
    duration: null,
    sequence: null,
    // Audio-only (pitch path).
    cents: null,
    frequency: null,
    quality: null,
    minClarity: null,
    maxClarity: null,
    stabilityCents: null,
    frameCount: 0,
    // MIDI fields: real values from Web MIDI, typical defaults for audio.
    velocity,
    channel,
  }
}

/**
 * Returns the public payload for a note: a live snapshot when `final` is false
 * (endTime/duration unresolved), or the completed note when `final` is true.
 * Sources that compute audio statistics after creation (e.g. createNoteTracker)
 * overwrite the audio-only fields on the returned object.
 */
export function snapshotNote(note, { final = false } = {}) {
  const endTime =
    final ? (note.endTime ?? note.lastPitchTime ?? note.startTime) : null
  return {
    midi: note.midi,
    name: note.name,
    octave: note.octave,
    startTime: note.startTime,
    endTime,
    duration: final ? endTime - note.startTime : null,
    sequence: note.sequence,
    cents: note.cents ?? null,
    frequency: note.frequency ?? null,
    quality: note.quality ?? null,
    minClarity: note.minClarity ?? null,
    maxClarity: note.maxClarity ?? null,
    stabilityCents: note.stabilityCents ?? null,
    frameCount: note.frameCount ?? 0,
    velocity: note.velocity ?? null,
    channel: note.channel ?? null,
  }
}

/**
 * Resolves the callback + clock contract shared by every note source. Each
 * source factory calls this, so all sources expose the same three callbacks and
 * an injectable clock without sharing an implementation (no inheritance).
 */
export function noteCallbacks(options = {}) {
  return {
    onNoteStart: options.onNoteStart ?? (() => {}),
    onNoteEnd: options.onNoteEnd ?? (() => {}),
    onNoteChange: options.onNoteChange ?? (() => {}),
    now: options.now ?? (() => performance.now()),
  }
}
