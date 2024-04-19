import { writable } from 'svelte/store'
import { WebMidi } from 'webmidi'

export const notes = writable({})

let currentInput
export function listen(input) {
    if (currentInput) {
        WebMidi.getInputByName(currentInput).removeListener() // remove all
    }
    currentInput = input
    WebMidi.getInputByName(input).addListener(
        'noteon', // all channels
        (e) => {
            notes.set(e.note)
        },
    )
}

export const midiReady = WebMidi.enable()
    .then((e) => {
        if (WebMidi.inputs.length) {
            listen(WebMidi.inputs[0].name)
        }
        return WebMidi.inputs
    })
    .catch((err) => console.error(err))
