// Pure, framework-free helpers for converting between frequency, MIDI note
// numbers, note names and octaves. Kept separate so they can be unit-tested in
// isolation and reused anywhere (detection, matching, display, etc.).

export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export const NOTE_NAMES_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

/** Frequency (Hz) → fractional MIDI note (A4 = 69). */
export function freqToMidi(freq, refA4 = 440) {
  return 69 + 12 * Math.log2(freq / refA4)
}

/** MIDI note number → chromatic note name, e.g. 60 → "C" (or "Db" when flat). */
export function midiToName(midi, accidental = 'sharp') {
  const rounded = Math.round(midi)
  const pc = ((rounded % 12) + 12) % 12
  return (accidental === 'flat' ? NOTE_NAMES_FLAT : NOTE_NAMES)[pc]
}

/** Note name ("C", "F#", "Db", "B#", …) → pitch-class MIDI (0–11). */
export function nameToPc(name) {
  const pc = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
    'B#': 0,
    Cb: 11,
  }[name]
  return pc
}

/** MIDI note number → scientific-pitch octave, e.g. 60 → 4 (C4). */
export function midiToOctave(midi) {
  return Math.floor(Math.round(midi) / 12) - 1
}
