import { writable, derived } from 'svelte/store'
import { get as getInterval, semitones, simplify, distance } from '@tonaljs/interval'
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
    'So',
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
    '#1',
    '2',
    '#2',
    '3',
    '4',
    '#4',
    '5',
    '#5',
    '6',
    '#6',
    '7',
]
const numericalEnharmonics = {
    '#1': 'b2',
    '#2': 'b3',
    '#4': 'b5',
    '#5': 'b6',
    '#6': 'b7',
}
const numericalEnharmonic = (number) => numericalEnharmonics[number] ?? number

export const majorTonic = writable()
export const relativeNotes = derived([notes, majorTonic], ([$notes, $majorTonic], _, update) => {
    update((prev) => {
        const name = $notes.identifier ?? ''
        const degree = $majorTonic ? simplify(distance($majorTonic, name)) : ''
        const delta = prev.name ? distance(prev.name, name) : ''
        const dir = getInterval(delta).dir

        return {
            raw: $notes,
            name,
            pitchClass: pitchClass(name),
            degree,
            numerical: degree ? numericals[semitones(degree)] : '',
            solfege: degree ? solfegeSyllables[semitones(degree)] : '',
            majorTonic: $majorTonic,
            delta,
            deltaDir: Number.isNaN(dir) ? 0 : dir
        }
    })
}, {})
