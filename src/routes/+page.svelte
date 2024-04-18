<script>
  import { WebMidi } from 'webmidi'

  document.title = 'Solfege View'
  let note = {}

  $: formattedNote = `${note.name ?? ''}${note.accidental ?? ''}`

  let currentInput
  function listen(input) {
    if (currentInput) {
      WebMidi.getInputByName(currentInput).removeListener() // remove all
      note = {}
    }
    currentInput = input
    WebMidi.getInputByName(input).addListener(
      'noteon', // all channels
      (e) => {
        note = e.note
      },
    )
  }

  const midiReady = WebMidi.enable()
    .then((e) => {
      if (WebMidi.inputs.length) {
        listen(WebMidi.inputs[0].name)
      }
    })
    .catch((err) => console.error(err))
</script>

<h1>{document.title}</h1>
<p>
  <a href="/about">About</a>
</p>
<p>
  <label>
    MIDI Input:
    <select on:change={(e) => listen(e.target.value)}>
      {#await midiReady then}
        {#each WebMidi.inputs as input}
          <option>{input.name}</option>
        {/each}
      {/await}
    </select>
  </label>
</p>

<div id="note">{formattedNote}</div>

<style>
  :global(body) {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
      sans-serif;
  }
  #note {
    width: 6rem;
    height: 5rem;
    border: 1px solid;
    font-size: 5rem;
    padding: 0.2rem;
  }
</style>
