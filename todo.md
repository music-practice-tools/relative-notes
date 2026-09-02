# TODO

## Client-only rendering config (`src/routes/+layout.js`)

The app is intentionally client-only:

```js
export const prerender = true
export const ssr = false
```

- `ssr = false` disables server-side rendering, so pages render in the browser
  only. This is what allows `settings.js` and `voice.js` to safely touch
  `localStorage` / `location` at module scope.
- `prerender = true` is currently redundant: combined with `ssr = false`,
  SvelteKit only emits an empty HTML shell per route (no meaningful prerendered
  markup), so the flag does nothing useful.

### Follow-ups

- Decide whether to remove `prerender = true` (it has no effect alongside
  `ssr = false`) or re-enable SSR with proper guards around browser-only globals.
- If SSR is ever enabled, the module-scope `localStorage` access in
  `src/lib/settings.js` and the `location.search` access in `src/lib/voice.js`
  must be moved behind a `browser` check (or into `onMount`).
- The internal navigation links use `data-sveltekit-reload` to force full page
  reloads. This works around app-lifetime state (settings persistence, MIDI
  device discovery) being tied to a full page load. If SPA navigation is wanted,
  that state management needs to be revisited.



## Minor / informational

- **`enableMidi()` dead code / redundancy** (`midi-notes.js:57-75`): the `throw ""` + `if (!navigator.requestMIDIAccess)` re-check inside `.then`/`.catch` is redundant — `WebMidi.enable()` already handles missing MIDI support. The `console.error(err.message)` logs `undefined` in that path.
- **Unused `accidental` field**: both `midi-notes.js:29` and `voice.js:32` compute an `accidental` property on the note object that nothing reads.
- **`document.title` round-trip** (`+page.svelte:9,42`): `document.title = 'Relative Notes'` then `<h1>{document.title}</h1>` — could just be a literal; the indirection is unnecessary.
- **`settings.unsubscribe` naming** (`settings.js:8`): mutating the store instance with a custom `unsubscribe` property works but is surprising; a named export or a separate persistence function would be cleaner.
- **Formatting**: `npx prettier --check` reports 11 non-`lib/pitch` files unformatted (including `relative-notes.js`, `settings.js`, `voice.js`, `Settings.svelte`, `+page.svelte`, etc.) despite a `format` script existing. Not a bug, but the tree isn't format-clean.
- **`$env/static/public` comment** (`midi-notes.js:3,54`): `PUBLIC_IS_LIVE` is undefined with no `.env`, so `validation: true` in dev. It must be explicitly set on hosting for `validation: false` to take effect — the inline comment is cryptic about this.

## Sharp/flat intonation indicator (microphone only)

- The pitch engine already computes `cents` — the note's average offset from the
  nearest equal-tempered semitone (positive = sharp, negative = flat) — in
  `src/lib/pitch/note-tracker.js` (`payload.cents = (meanMidi - note.midi) * 100`).
- `voice.js` `toNote()` currently drops `cents` when bridging into the shared
  `notes` store; MIDI notes stay `cents: null` (they're quantized).
- To add: pass `cents` through in `toNote()`, then read it in the UI as
  `$relativeNotes.raw.cents` and render a sharp/flat marker when `|cents|`
  exceeds a tolerance (e.g. ±10¢), otherwise "in tune".
- Open decisions: tolerance, symbol (♯/♭ vs ↑/↓ — note ↑/↓ is already used for
  the "Change" field), and live-updating (poll `getCurrentNote()` / a per-frame
  hook) vs per-note (updates on note start/change only).

