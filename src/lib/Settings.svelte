<script>
  import { onMount, onDestroy } from 'svelte'
  import { midiReady, listen } from '$lib/midi-notes'
  import { settings } from '$lib/settings.js'

  const systemValues = ['Solfège', 'Nashville', 'Roman']
  //  const chromaticsValues = ['Melody', 'Lower', 'Raise']

  midiReady.then(() => {
    if ($settings.input) {
      listen($settings.input)
    }
  })
  onDestroy(settings.unsubscribe)
</script>

<div id="wrapper">
  {#await midiReady}
    <span class="warn">Waiting for MIDI access...</span>
  {:then midiInputs}
    <div class="setting">
      <label for="midi-input">MIDI Input: </label>
      <select
        id="midi-input"
        on:change={(e) => {
          listen(e.target.value)
        }}
        bind:value={$settings.input}>
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
      <label>
        System:
        <select bind:value={$settings.system}>
          {#each systemValues as system}
            <option>{system}</option>
          {/each}
        </select>
      </label>
    </div>

    <!-- 
    <div class="setting">
      <label>
        Chromatics:
        <select bind:value={$settings.chromatics}>
          {#each chromaticsValues as mode}
            <option>{mode}</option>
          {/each}
        </select>
      </label>
    </div>
  -->
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
    border: 2px solid var(--highlight-color);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }
</style>
