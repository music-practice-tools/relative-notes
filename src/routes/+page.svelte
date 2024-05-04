<script>
  import { relativeNotes, majorTonic } from '$lib/relative-notes'
  import Settings from '$lib/Settings.svelte'
  import { settings } from '$lib/settings.js'
  import logo from '$lib/assets/logo-512x512.png'
  import IFRTonalMap from '$lib/IFRTonalMap.svelte'

  document.title = 'Relative Notes'

  const tonics = 'C C# D D# E F F# G G# A A# B B#'.split(' ')
  const delta = { '-1': '↓', '0': '', '1': '↑' }
</script>

<div id="app">
  <header>
    <img
      src={logo}
      title="Relative Notes"
      class="logo"
      alt="logo" />
    <h1>{document.title}</h1>
  </header>
  <nav>
    <p>
      <a href="/about">About</a>
    </p>
  </nav>
  <Settings></Settings>
  <div id="tonic">
    <label>
      Major Tonic:
      <select bind:value={$majorTonic}>
        {#each tonics as note}
          <option>{note}</option>
        {/each}
      </select>
    </label>
    {#if $relativeNotes.pitchClass && $relativeNotes.pitchClass != ($majorTonic ?? '')}
      <button on:click={majorTonic.set($relativeNotes.pitchClass)}
        >Set {$relativeNotes.pitchClass}</button>
    {/if}
  </div>

  <div id="notes-container">
    <div id="note-container">
      {#if $settings.system === 'Solfège'}
        <div id="note">{$relativeNotes.solfege}</div>
      {:else if $settings.system === 'Nashville'}
        <div id="note">{$relativeNotes.numerical}</div>
      {:else}
        <div id="note">{$relativeNotes.roman}</div>
      {/if}

      <div id="detail">
        MIDI:
        {$relativeNotes.raw.channel ?? ''}
        {$relativeNotes.raw.number ?? ''}
        &nbsp;Note:
        {$relativeNotes.name}
        {$relativeNotes.interval}
        &nbsp;Change:
        {$relativeNotes.delta}
        {delta[$relativeNotes.deltaDir]}
      </div>
    </div>

    <div id="ifrMap">
      <IFRTonalMap interval={$relativeNotes.interval} />
    </div>
  </div>
</div>

<style>
  :global(:root) {
    --background-color: #242424;
    --color: #ffffff;
    --highlight-color: lightblue;
    --link-color: #858bff;
    background-color: var(--background-color);
    color: var(--color);
    font-family: Sans-Serif;
    color-scheme: light dark;
  }

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
    width: 14rem;
    height: 14rem;
    font-size: 12rem;
    padding: 0.2rem;
    color: -var(highlight-color);
  }

  #tonic,
  #tonic button,
  #tonic select {
    font-size: 1.5rem;
  }
  #tonic button {
    margin-left: 1rem;
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
  }
  #ifrMap {
    margin-left: 3rem;
    height: 14rem;
  }

  @media (prefers-color-scheme: light) {
    :global(:root) {
      --background-color: #ffffff;
      --color: #242424;
      --highlight-color: darkblue;
    }
  }
</style>
