import { writable, derived } from 'svelte/store'
import { get as getInterval, semitones, simplify, distance } from '@tonaljs/interval'
import { pitchClass } from '@tonaljs/note'
import { notes } from '$lib/midi-notes'

const acc = { '-1': 'b', '0': '', '1': '#' }

const solfegeSyllables = [
    { '-1': '', '0': 'Do', '1': 'Di' },
    { '-1': 'Ra', '0': 'Re', '1': 'Ri' },
    { '-1': 'Me', '0': 'Mi', '1': '' },
    { '-1': '', '0': 'Fa', '1': 'Fi' },
    { '-1': 'Se', '0': 'So', '1': 'Si' },
    { '-1': 'Le', '0': 'La', '1': 'Li' },
    { '-1': 'Te', '0': 'Ti', '1': '' }
]

const roman = 'I II III IV V VI VII'.split(' ')

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
        const interval = simplify(distance($majorTonic, name))
        const _semitones = semitones(interval)
        const delta = prev.name ? distance(prev.name, name) : ''
        const dir = getInterval(delta).dir
        const deltaDir = Number.isNaN(dir) ? 0 : dir

        const intv = getInterval(interval)
        const step = intv.empty ? -1 : intv.step
        const alt = acc[intv.alt]

        return {
            raw: $notes,
            name: name,
            pitchClass: pitchClass(name),
            interval,
            solfege: !intv.empty ? `${solfegeSyllables[step][intv.alt]}` : '',
            numerical: !intv.empty ? `${alt}${step + 1}` : '',
            roman: !intv.empty ? `${alt}${roman[step]}` : '',
            majorTonic: $majorTonic,
            delta,
            deltaDir
        }
    })
}, {})
