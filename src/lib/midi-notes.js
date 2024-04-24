import { writable } from 'svelte/store'
import { WebMidi } from 'webmidi'

export const notes = writable({})

let currentInput
export function listen(input) {
    if (!input) { return }
    if (currentInput) {
        WebMidi.getInputByName(currentInput).removeListener() // remove all
    }
    if (!_input) { return }
    currentInput = input
    const _input = WebMidi.getInputByName(input)
    _input.addListener(
        'noteon', // all channels
        (e) => {
            notes.set(e.note)
        },
    )
}

function throwAlert(type, message) {
    window.dispatchEvent(new CustomEvent('alert', {
        detail: `${type}: ${message}`
    }))
}

export const midiReady = WebMidi.enable({/*validation: false // speedup - not for dev*/ })
    .then((e) => {
        return WebMidi.inputs
    })
    .catch((err) => {
        console.error(err.message)
        throw new Error("No MIDI devices were detected, you may need to refresh the page or restart your browser.")
    })
