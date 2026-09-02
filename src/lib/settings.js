import { writable } from 'svelte/store'

const defaultSettings = { system: 'Nashville', chromatics: 'Lower', accidental: 'flat', source: 'Microphone' }

function loadSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem('settings') ?? '{}')
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
            return { ...defaultSettings, ...stored }
        }
    } catch (e) {
        // Storage unavailable or corrupt - fall back to defaults.
    }
    return { ...defaultSettings }
}

export const settings = writable(loadSettings())

// Persist for the lifetime of the app. `settings` is a singleton store, so this
// subscription is intentionally never torn down (unsubscribing on a component
// unmount would silently stop persistence).
settings.subscribe((value) => {
    try {
        localStorage.setItem('settings', JSON.stringify(value))
    } catch (e) {
        // Storage unavailable (e.g. private browsing) - persistence is best-effort.
    }
})
