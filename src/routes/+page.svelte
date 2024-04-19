<script>
  import { midiReady, listen } from '$lib/midi-notes'
  import { relativeNotes, majorTonic } from '$lib/relative-notes'
  import { names } from '@tonaljs/note'
</script>

document.title = 'Solfège View'

<h1>{document.title}</h1>
<p>
  <a href="/about">About</a>
</p>
<p>
  <label>
    MIDI Input:
    <select on:change={(e) => listen(e.target.value)}>
      {#await midiReady then midiInputs}
        {#each midiInputs as input}
          <option>{input.name}</option>
        {/each}
      {/await}
    </select>
  </label>
</p>

<div id="number">Numeric: {$relativeNotes.numerical}</div>
<div id="solfege">Solfège: {$relativeNotes.solfege}</div>
<div id="note">Note: {$relativeNotes.name}</div>

<p id="tonic">
  Do: {$majorTonic ?? ''}
  <label>
    Set:
    <select on:change={(e) => majorTonic.set(e.target.value)}>
      {#each names() as note}
        <option>{note}</option>
      {/each}
    </select>
    {#if $relativeNotes.pitchClass != ($majorTonic ?? '')}
      <button on:click={majorTonic.set($relativeNotes.pitchClass)}
        >Set {$relativeNotes.pitchClass}</button>
    {/if}
  </label>
</p>

<style>
  :global(body) {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
      sans-serif;
  }
  #note,
  #number,
  #solfege,
  #tonic {
    font-size: 2rem;
    padding: 0.2rem;
  }

  #tonic button,
  #tonic select {
    font-size: 1rem;
    padding: 0.2rem;
  }
</style>
