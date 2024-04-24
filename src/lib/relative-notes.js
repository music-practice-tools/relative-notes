import { writable, derived } from 'svelte/store'
import { get as getInterval, semitones, simplify, distance } from '@tonaljs/interval'
import { pitchClass } from '@tonaljs/note'
import { get as getRomanNumeral } from "@tonaljs/roman-numeral";
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
    'Di': 'Ra',
    'Ri': 'Me',
    'Fi': 'Se',
    'Si': 'Le',
    'Li': 'Te',
}

const numericals = [
    '1',
    '#2',
    '2',
    '#3',
    '3',
    '4',
    '#5',
    '5',
    '#6',
    '6',
    '#7',
    '7',
]
const numericalEnharmonics = {
    '#1': 'b2',
    '#2': 'b3',
    '#4': 'b5',
    '#5': 'b6',
    '#6': 'b7',
}
const romanEnharmonics = {
    '#I': 'bII',
    '#II': 'bII',
    '#IV': 'bV',
    '#V': 'bVI',
    '#VI': 'bVII',
}

/*function enharmonic(mode) {
    const flats = mode == 'Solfège', 'Nashville', 'Roman'

    return (note, direction) => {
        useFlats =
            mode == 'Melody' && direction == -1 ||
            mode == 'Flat'

        return useFlats ? flats[note] ?? note : note
    }
}
const solfegeEnharmonic = enharmonic(solfegeEnharmonics)
const numericalEnharmonic = enharmonic(numericalEnharmonics)
const romanEnharmonic = enharmonic(romanEnharmonics)
*/
export const majorTonic = writable()
export const relativeNotes = derived([notes, majorTonic], ([$notes, $majorTonic], _, update) => {
    update((prev) => {
        const name = $notes.identifier ?? ''
        const step = simplify(distance($majorTonic, name))
        const _semitones = semitones(step)
        const delta = prev.name ? distance(prev.name, name) : ''
        const dir = getInterval(delta).dir
        const direction = Number.isNaN(dir) ? 0 : dir

        return {
            raw: $notes,
            name: name,
            pitchClass2: $notes.name + $notes.accidental,
            pitchClass: pitchClass(name),
            step,
            solfege: step ? solfegeSyllables[_semitones] : '',
            numerical: step ? numericals[_semitones] : '',
            roman: step ? getRomanNumeral(getInterval(step)).name : '',
            majorTonic: $majorTonic,
            delta,
            deltaDir: direction
        }
    })
}, {})
