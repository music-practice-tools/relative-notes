<script>
  import { midiReady, listen } from '$lib/midi-notes'

  export let system = 'Solfa'
  export let chromatics = 'Lower'

  const chromaticsValues = ['Lower', 'Raise', 'Melody']
</script>

<div id="wrapper">
  {#await midiReady}
    <span class="warn">Waiting for MIDI access...</span>
  {:then midiInputs}
    <div class="setting">
      <label for="midi-input">MIDI Input: </label>
      <select
        id="midi-input"
        on:change={(e) => listen(e.target.value)}>
        {#if midiInputs && midiInputs.length > 0}
          {#each midiInputs as input}
            <option>{input.name}</option>
          {/each}
        {:else}
          <span class="warn">None found</span>
        {/if}
      </select>
    </div>

    <div class="setting">
      <label
        ><input
          type="radio"
          bind:group={system}
          value="Solfa" />Solfège</label>
      <label
        ><input
          type="radio"
          bind:group={system}
          value="NNS" />Nashville</label>
    </div>

    <div class="setting">
      <label>
        Chromatics:
        <select bind:value={chromatics}>
          {#each chromaticsValues as mode}
            <option>{mode}</option>
          {/each}
        </select>
      </label>
    </div>
  {:catch error}
    <span class="warn">{error.message}</span>
  {/await}
</div>

<style>
  .warn {
    color: red;
  }

  div.setting {
    display: inline-block;
    margin-left: 1rem;
  }
  div#wrapper {
    border: 2px solid darkblue;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }
</style>
