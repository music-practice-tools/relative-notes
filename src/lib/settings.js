import { writable } from 'svelte/store'

const defaultSettings = { system: 'Solfège', chromatics: 'Lower', accidental: 'flat', source: 'Microphone' }
export const settings = writable({
    ...defaultSettings,
    ...JSON.parse(localStorage.getItem('settings') ?? '{}'),
})
settings.unsubscribe = settings.subscribe(
    (value) => (localStorage.settings = JSON.stringify(value)),
)
