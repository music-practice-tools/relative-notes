// Framework-free microphone note source. Wires the live-mic pitch engine
// (LiveMicPitchTracker) into the note tracker and exposes the same start()/
// stop() + events interface as createWebMidiNoteSource, so an app can switch
// between a Web MIDI keyboard and a microphone without changing how it
// consumes notes.
//
// Besides the shared note events it adds two mic-specific hooks:
//   - `onFrame(frame)` — the raw filtered frame ({ pitch, clarity,
//     rawFrequency, rms, rejectReason }) for diagnostics.
//   - `setMinLevelDb(db)` — the loudness gate in dBFS (derives `minRms`).

import { LiveMicPitchTracker } from './pitch.js'
import { createNoteTracker } from './note-tracker.js'
import { noteCallbacks } from './note-events.js'

export function createMicNoteSource(options = {}) {
  const { onNoteStart, onNoteEnd, onNoteChange, now } = noteCallbacks(options)
  const onFrame = options.onFrame ?? (() => {})

  // `tracker` / `noteTracker` options forward straight through to the
  // underlying engine, so advanced tuning stays available without the caller
  // having to wire the two stages together by hand.
  const tracker = new LiveMicPitchTracker(options.tracker ?? {})
  const noteTracker = createNoteTracker({
    ...(options.noteTracker ?? {}),
    now,
    onNoteStart,
    onNoteEnd,
    onNoteChange,
  })

  function setMinLevelDb(db) {
    tracker.minRms = Math.pow(10, db / 20)
  }

  async function start() {
    if (tracker.isTracking) return
    noteTracker.reset()
    await tracker.start((frame) => {
      onFrame(frame)
      noteTracker.update(frame)
    })
  }

  function stop() {
    tracker.stop()
    noteTracker.reset()
  }

  function getCurrentNote() {
    return noteTracker.getCurrentNote()
  }

  return { start, stop, getCurrentNote, setMinLevelDb }
}
