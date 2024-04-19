import { writable, derived } from 'svelte/store'
import { semitones, simplify, distance } from '@tonaljs/interval'
import { pitchClass } from '@tonaljs/note'
import { notes } from '$lib/midi-notes'

const solfegeSyllables = [
    'Do',
    'Di',
    'Re',
    'Ri',
    'Mi',
    'Fa',
    'Fi',
    'Sol',
    'Si',
    'La',
    'Li',
    'Ti',
]
const solfegeEnharmonics = {
    Di: 'Ra',
    Ri: 'Me',
    Fi: 'Se',
    Si: 'Le',
    Li: 'Te',
}
const solfegeEnharmonic = (syllable) =>
    solfegeEnharmonics[syllable] ?? syllable

const numericals = [
    '1',
    '1#',
    '2',
    '2#',
    '3',
    '4',
    '4#',
    '5',
    '5#',
    '6',
    '6#',
    '7',
]
const numericalEnharmonics = {
    '1#': '2b',
    '2#': '3b',
    '4#': '5b',
    '5#': '6b',
    '6#': '7b',
}
const numericalEnharmonic = (number) => numericalEnharmonics[number] ?? number

export const majorTonic = writable()
export const relativeNotes = derived([notes, majorTonic], ([$notes, $majorTonic]) => {
    const noteName = $notes.identifier ?? ''
    const interval = $majorTonic ? simplify(distance($majorTonic, noteName)) : ''

    return {
        raw: $notes,
        name: noteName,
        pitchClass: pitchClass(noteName),
        interval,
        numerical: interval ? numericals[semitones(interval)] : '',
        solfege: interval ? solfegeSyllables[semitones(interval)] : '',
        majorTonic: $majorTonic
    }
}, {})
