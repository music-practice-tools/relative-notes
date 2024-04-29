import { writable } from 'svelte/store'
import { WebMidi } from 'webmidi'

export const notes = writable({})

let currentInput
export function listen(input) {
    if (!input) { return }
    if (currentInput) {
        try {
            WebMidi.getInputByName(currentInput).removeListener() // remove from all channels
        } catch (e) { /* don't care */ }
    }
    currentInput = input
    const _input = WebMidi.getInputByName(input)
    if (!_input) { return }
    _input.addListener(
        'noteon', // all channels
        (e) => {
            notes.set({
                channel: e.message.channel,
                number: e.note.number,
                identifier: e.note.identifier,
                name: e.note.name,
                accidental: e.note.accidental,
                octave: e.note.octave,
            })
        },
    )
}

function throwAlert(type, message) {
    window.dispatchEvent(new CustomEvent('alert', {
        detail: `${type}: ${message}`
    }))
}

const ERR_NO_MIDI = "Your web browser doesn't support MIDI. Try another like Chrome, Firefox or Edge."
const ERR_NO_INPUTS = "No MIDI devices were detected, you may need to refresh or restart your browser."
export const midiReady = WebMidi.enable({/*validation: false // speedup - not for dev*/ })
    .then((e) => {
        if (!navigator.requestMIDIAccessa){ 
            throw ""
        }
        
        const inputs = WebMidi.inputs
        if (inputs.length == 0) { throw new Error(ERR_NO_INPUTS) } // happens sometimes rather than error
        return WebMidi.inputs
    })
    .catch((err) => {
        if (!navigator.requestMIDIAccessa){ 
            throw new Error(ERR_NO_MIDI)
        }
        
        console.error(err.message)
        throw new Error(ERR_NO_INPUTS)
    })
