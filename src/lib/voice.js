// Bridges the microphone note source into the same `notes` store used by the
// Web MIDI path, so the rest of the app (relative-notes.js) treats both inputs
// identically. `startVoice()`/`stopVoice()` mirror `listen()` in midi-notes.js.

import { get, writable } from 'svelte/store'
import { notes } from '$lib/midi-notes'
import { settings } from '$lib/settings'
import { midiToName } from '$lib/pitch/notes'
import { createMicNoteSource } from '$lib/pitch/mic-notes'

let mic = null

// Dev-only: append ?diagnostics to the URL to log note events + show a raw
// per-frame readout.
export const showDiagnostics = new URLSearchParams(location.search).has(
  'diagnostics',
)

// Latest throttled per-frame readout, for the diagnostics UI.
export const diagnosticFrame = writable(null)

const DIAG_INTERVAL_MS = 250
let lastDiagAt = 0

function toNote(note) {
  const name = midiToName(note.midi, get(settings).accidental)
  return {
    channel: note.channel,
    number: note.midi,
    identifier: `${name}${note.octave}`,
    name,
    accidental: name.includes('#') ? '#' : name.includes('b') ? 'b' : '',
    octave: note.octave,
  }
}

function throwAlert(message) {
  window.dispatchEvent(new CustomEvent('alert', { detail: message }))
}

export function startVoice() {
  if (!mic) {
    mic = createMicNoteSource({
      onNoteStart: (note) => {
        if (showDiagnostics) console.info('note-on', note)
        notes.set(toNote(note))
      },
      onNoteEnd: (note) => {
        if (showDiagnostics) console.info('note-off', note)
      },
      onNoteChange: (prev, next) => {
        if (showDiagnostics) console.info('note-change', { from: prev, to: next })
      },
      onFrame: (frame) => {
        if (!showDiagnostics) return
        const now = performance.now()
        if (now - lastDiagAt >= DIAG_INTERVAL_MS) {
          lastDiagAt = now
          diagnosticFrame.set({
            pitch: frame.pitch,
            frequency: frame.rawFrequency,
            clarity: frame.clarity,
            rms: frame.rms,
            rejectReason: frame.rejectReason,
          })
        }
      },
    })
  }
  return mic.start().catch((error) => {
    throwAlert(`Microphone: ${error.message}`)
    throw error
  })
}

export function stopVoice() {
  if (mic) mic.stop()
}
