import { writable } from 'svelte/store'
import { WebMidi } from 'webmidi'

export const notes = writable({})

let currentInput
export function listen(input) {
    if (!input) { return }
    if (currentInput) {
        WebMidi.getInputByName(currentInput).removeListener() // remove all
    }
    currentInput = input
    const _input = WebMidi.getInputByName(input)
    if (!_input) { return }
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

const ERR_NO_INPUTS = "No MIDI devices were detected, you may need to refresh or restart your browser."
export const midiReady = WebMidi.enable({/*validation: false // speedup - not for dev*/ })
    .then((e) => {
        const inputs = WebMidi.inputs
        if (inputs.length == 0) { throw new Error(ERR_NO_INPUTS) } // happens sometimes rather than error
    })
    .catch((err) => {
        console.error(err.message)
        throw new Error(ERR_NO_INPUTS)
    })
