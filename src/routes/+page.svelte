<script>
  import { relativeNotes, majorTonic } from '$lib/relative-notes'
  import Settings from '$lib/Settings.svelte'
  import { settings } from '$lib/settings.js'
  import { midiToName, nameToPc } from '$lib/pitch/notes'
  import logo from '$lib/assets/logo-512x512.png'
  import IFRTonalMap from '$lib/IFRTonalMap.svelte'

  document.title = 'Relative Notes'

  const delta = { '-1': '↓', '0': '', '1': '↑' }

  $: tonics = (
    $settings.accidental === 'flat' ?
      'C Db D Eb E F Gb G Ab A Bb B'
    : 'C C# D D# E F F# G G# A A# B').split(' ')

  // Show ♭/♯ glyphs while keeping stored values ASCII ("Db"/"C#") so Tonal's
  // distance() and nameToPc() keep working.
  const noteLabel = (note) => (note ?? '').replace('b', '♭').replace('#', '♯')

  // Re-spell the selected tonic when the accidental preference changes.
  $: if ($settings.accidental && $majorTonic) {
    const pc = nameToPc($majorTonic)
    if (pc != null) {
      const respelled = midiToName(pc, $settings.accidental)
      if (respelled !== $majorTonic) majorTonic.set(respelled)
    }
  }
</script>

<div id="app">
  <header>
    <a
      href="/"
      class="logo-link">
      <img
        src={logo}
        title="Relative Notes"
        class="logo"
        alt="logo" />
    </a>
    <h1>{document.title}</h1>
  </header>
  <nav>
    <p>
      <a
        href="/about"
        data-sveltekit-reload>About</a>
    </p>
  </nav>
  <Settings></Settings>
  <div id="tonic">
    <label>
      Major Tonic:
      <select bind:value={$majorTonic}>
        {#each tonics as note}
          <option value={note}>{noteLabel(note)}</option>
        {/each}
      </select>
    </label>
    {#if $relativeNotes.pitchClass && $relativeNotes.pitchClass != ($majorTonic ?? '')}
      <button on:click={majorTonic.set($relativeNotes.pitchClass)}
        >Set {noteLabel($relativeNotes.pitchClass)}</button>
    {/if}
  </div>

  <div id="notes-container">
    <div id="note-container">
      {#if $settings.system === 'Solfège'}
        <div id="note">{$relativeNotes.solfege}</div>
      {:else if $settings.system === 'Nashville'}
        <div id="note">{noteLabel($relativeNotes.numerical)}</div>
      {:else if $settings.system === 'Roman'}
        <div id="note">{noteLabel($relativeNotes.roman)}</div>
      {:else if $settings.system === 'Sargam'}
        <div id="note">{$relativeNotes.sargam}</div>
      {:else}
        <div id="note"></div>
      {/if}

      <div id="detail">
        MIDI:
        {$relativeNotes.raw.channel ?? ''}
        {$relativeNotes.raw.number ?? ''}
        &nbsp;Note:
        {noteLabel($relativeNotes.name)}
        {$relativeNotes.interval}
        &nbsp;Change:
        {$relativeNotes.delta}
        {delta[$relativeNotes.deltaDir]}
      </div>
    </div>

    <div id="ifrMap">
      <IFRTonalMap
        step={$relativeNotes.step}
        alt={$relativeNotes.altKey} />
    </div>
  </div>
</div>

<style>
  /*  :global(body) {
    margin: 0;
    display: flex;
    min-height: 100vh;
  }
*/

  h1 {
    font-size: 1.5rem;
    line-height: 1;
    margin-left: 1rem;
  }

  #app {
    max-width: 1280px;
    margin: 0 auto 0 auto;
    padding: 0rem;
    text-align: left;
  }

  .logo {
    height: 4em;
    will-change: filter;
  }

  .logo-link {
    margin-left: 0;
    text-decoration: none;
    display: inline-flex;
    line-height: 0;
  }

  header {
    margin-bottom: 0rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a {
    font-weight: 500;
    color: var(--link-color);
    text-decoration: underline;
    margin-left: 5px;
    font-size: inherit;
    cursor: pointer;
  }

  #note {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    width: 16rem;
    height: 16rem;
    font-size: 14rem;
    line-height: 1;
    padding: 0.2rem;
  }

  #tonic,
  #tonic button,
  #tonic select {
    font-size: 1.5rem;
  }
  #tonic button {
    margin-left: 1rem;
  }
  #tonic select,
  #tonic button {
    height: 2.25rem;
    box-sizing: border-box;
    vertical-align: middle;
  }
  #detail {
    font-size: 1.1rem;
    width: 22rem;
  }
  #note,
  :global(a) {
    color: var(--highlight-color);
  }

  #notes-container {
    display: flex;
  }
  #note-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  #ifrMap {
    margin-left: 3rem;
    width: 6rem;
    height: 18rem;
  }
</style>
