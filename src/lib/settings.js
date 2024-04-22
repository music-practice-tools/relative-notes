import { writable } from 'svelte/store'

const defaultSettings = { system: 'Solfa', chromatics: 'Lower' }
export const settings = writable(
    JSON.parse(
        localStorage.getItem('settings') ?? JSON.stringify(defaultSettings),
    ),
)
settings.unsubscribe = settings.subscribe(
    (value) => (localStorage.settings = JSON.stringify(value)),
)
