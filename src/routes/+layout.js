import { browser } from '$app/environment'

export const prerender = true
export const ssr = false

if (browser) {
    // Global exception handlers
    window.addEventListener('alert', (event) => {
        alert(event.detail)
    })
}