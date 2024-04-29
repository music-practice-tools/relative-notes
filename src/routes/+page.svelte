<script>
  import { relativeNotes, majorTonic } from '$lib/relative-notes'
  import Settings from '$lib/Settings.svelte'
  import { settings } from '$lib/settings.js'

  document.title = 'Relative Notes'

  const tonics = 'C C# D D# E F F# G G# A A# B B#'.split(' ')
  const delta = { '-1': '↓', '0': '', '1': '↑' }
</script>

<h1>{document.title}</h1>
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

  {#if $settings.system === 'Solfège'}
    <div id="note">{$relativeNotes.solfege}</div>
  {:else if $settings.system === 'Nashville'}
    <div id="note">{$relativeNotes.numerical}</div>
  {:else}
    <div id="note">{$relativeNotes.roman}</div>
  {/if}
</div>

<div id="detail">
  MIDI:
  {$relativeNotes.raw.channel ?? ''}
  {$relativeNotes.raw.number ?? ''}
  &nbsp;Note:
  {$relativeNotes.name}
  &nbsp;Change:
  {$relativeNotes.delta}
  {delta[$relativeNotes.deltaDir]}
</div>

<style>
  :global(:root) {
    background-color: #242424;
    color: #ffffff;
    font-family: Sans-Serif;
    color-scheme: light dark;
    --highlight-color: lightblue;
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
  }
  #note,
  :global(a) {
    color: var(--highlight-color);
  }

  @media (prefers-color-scheme: light) {
    :global(:root) {
      color: #242424;
      background-color: #ffffff;
      --highlight-color: darkblue;
    }
  }
</style>
