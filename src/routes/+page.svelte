<script>
  import { relativeNotes, majorTonic } from '$lib/relative-notes'
  import { get as getScale } from '@tonaljs/scale'
  import Settings from '$lib/Settings.svelte'
  import { settings } from '$lib/settings.js'

  document.title = 'Relative Notes'

  const tonics = getScale('C chromatic').notes // all flats
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
  Note:
  {$relativeNotes.name}
  Change:
  {$relativeNotes.delta}
  {delta[$relativeNotes.deltaDir]}
</div>

<style>
  :global(body) {
    font-family: Sans-Serif;
  }
  #note {
    width: 14rem;
    height: 14rem;
    font-size: 12rem;
    padding: 0.2rem;
    color: darkblue;
  }

  #tonic,
  #tonic button,
  #tonic select {
    font-size: 1.5rem;
  }
  #tonic button {
    margin-left: 1rem;
  }
</style>
