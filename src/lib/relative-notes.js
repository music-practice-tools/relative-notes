import { writable, derived } from 'svelte/store'
import { get as getInterval, semitones, simplify, distance } from '@tonaljs/interval'
import { enharmonic, pitchClass } from '@tonaljs/note'
import { get as getRomanNumeral } from "@tonaljs/roman-numeral";
import { notes } from '$lib/midi-notes'

const solfegeSyllables = [
    'Do',
    'Ra',
    'Re',
    'Me',
    'Mi',
    'Fa',
    'Se',
    'So',
    'Le',
    'La',
    'Te',
    'Ti',
]

const solfegeEnharmonics = {
    'Ra': 'Di',
    'Me': 'Ri',
    'Se': 'Fi',
    'Le': 'Si',
    'Te': 'Li',
}

const numericals = [
    '1',
    'b2',
    '2',
    'b3',
    '3',
    '4',
    'b5',
    '5',
    'b6',
    '6',
    'b7',
    '7',
]
const numericalEnharmonics = {
    'b2': '#1',
    'b3': '#2',
    'b5': '#4',
    'b6': '#5',
    'b7': '#6',
}
const romanEnharmonics = {
    'bII': '#I',
    'bII': '#II',
    'bV': '#IV',
    'bVI': '#V',
    'bVII': '#VI',
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
        const name = enharmonic($notes.identifier ?? '') // to b
        const degree = simplify(distance($majorTonic, name))
        const _semitones = semitones(degree)
        const delta = prev.name ? distance(prev.name, name) : ''
        const dir = getInterval(delta).dir
        const direction = Number.isNaN(dir) ? 0 : dir

        return {
            raw: $notes,
            name: name,
            pitchClass: pitchClass(name),
            degree,
            solfege: degree ? solfegeSyllables[_semitones] : '',
            numerical: degree ? numericals[_semitones] : '',
            roman: degree ? getRomanNumeral(getInterval(degree)).name : '',
            majorTonic: $majorTonic,
            delta,
            deltaDir: direction
        }
    })
}, {})
