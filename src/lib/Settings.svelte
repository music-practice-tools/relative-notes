<script>
  import { onDestroy } from 'svelte'
  import { enableMidi, listen, unlisten } from '$lib/midi-notes'
  import { diagnosticFrame, showDiagnostics, startVoice, stopVoice } from '$lib/voice'
  import { settings } from '$lib/settings.js'

  const systemValues = ['Solfège', 'Nashville', 'Roman', 'Sargam']
  //  const chromaticsValues = ['Melody', 'Lower', 'Raise']

  const sourceValues = ['MIDI', 'Microphone']

  let micRunning = false
  let midiInputs = null
  let midiError = null
  let midiWaiting = false

  function diagnosticStatus(reason) {
    if (reason == null) return 'accepted'
    const labels = {
      silence: 'silence',
      none: 'no pitch',
      clarity: 'low clarity',
      range: 'out of range',
    }
    return labels[reason] ?? reason
  }

  const padLeft = (s, n) => String(s).padStart(n)
  const padRight = (s, n) => String(s).padEnd(n)

  function fmtDb(rms) {
    if (rms == null || rms <= 0) return '—'
    return String(Math.round(20 * Math.log10(rms)))
  }

  function diagnosticGrid(d) {
    const gap = '  '
    const header = [
      padLeft('ACCEPT', 8),
      padLeft('LVL', 5),
      padLeft('RAW', 8),
      padLeft('CLR', 5),
      padRight('STATUS', 12),
    ].join(gap)

    const accepted = d && d.pitch != null ? d.pitch.toFixed(1) : '—'
    const level = d ? fmtDb(d.rms) : '—'
    const raw = d && d.frequency != null ? d.frequency.toFixed(1) : '—'
    const clarity = d ? `${Math.round(d.clarity * 100)}%` : '—'
    const status = d ? diagnosticStatus(d.rejectReason) : '—'

    const data = [
      padLeft(accepted, 8),
      padLeft(level, 5),
      padLeft(raw, 8),
      padLeft(clarity, 5),
      padRight(status, 12),
    ].join(gap)

    return `${header}\n${data}`
  }

  function startMic() {
    unlisten()
    startVoice()
      .then(() => {
        micRunning = true
      })
      .catch(() => {
        micRunning = false
      })
  }

  function stopMic() {
    stopVoice()
    micRunning = false
  }

  function useMidi() {
    stopMic()
    midiError = null
    midiWaiting = true
    enableMidi()
      .then((inputs) => {
        midiWaiting = false
        midiInputs = inputs
        if ($settings.source === 'MIDI') listen($settings.input)
      })
      .catch((err) => {
        midiWaiting = false
        midiError = err.message
      })
  }

  function switchSource(source) {
    if (source === 'Microphone') {
      stopMic()
      midiError = null
    } else {
      useMidi()
    }
  }

  // Start MIDI only on load; the microphone waits for an explicit button click
  // so the AudioContext is resumed within a user gesture (autoplay policy).
  if ($settings.source !== 'Microphone') useMidi()

  onDestroy(() => {
    stopVoice()
    settings.unsubscribe()
  })
</script>

<div id="wrapper">
  {#if midiWaiting}
    <div class="status">Waiting for MIDI access...</div>
  {:else if midiError}
    <div class="warn">{midiError}</div>
  {/if}

  <div class="setting aligned source-row">
    <label for="source">Source:</label>
    <select
      id="source"
      on:change={(e) => switchSource(e.target.value)}
      bind:value={$settings.source}>
      {#each sourceValues as source}
        <option>{source}</option>
      {/each}
    </select>
    {#if $settings.source === 'Microphone'}
      {#if micRunning}
        <button on:click={stopMic}>Stop microphone</button>
      {:else}
        <button on:click={startMic}>Start microphone</button>
      {/if}
    {/if}
  </div>

  <div class="setting aligned">
    <label for="accidental">Accidentals:</label>
    <select
      id="accidental"
      bind:value={$settings.accidental}>
      <option value="flat">♭ (flat)</option>
      <option value="sharp">♯ (sharp)</option>
    </select>
  </div>

  {#if $settings.source === 'Microphone' && showDiagnostics}
    <pre class="readout">{diagnosticGrid($diagnosticFrame)}</pre>
  {/if}

  {#if $settings.source === 'MIDI'}
    {#if midiInputs && midiInputs.length > 0}
      <div class="setting">
        <label for="midi-input">MIDI Input: </label>
        <select
          id="midi-input"
          on:change={(e) => {
            listen(e.target.value)
          }}
          bind:value={$settings.input}>
          {#each midiInputs as input}
            <option>{input.name}</option>
          {/each}
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
    {/if}
  {/if}
</div>

<style>
  .warn {
    color: red;
    margin-left: 1rem;
  }
  .status {
    color: var(--status-color);
    margin-left: 1rem;
  }

  div.setting {
    display: inline-block;
    margin-left: 1rem;
  }
  .setting.aligned {
    display: grid;
    grid-template-columns: 6.5rem max-content;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.25rem;
  }
  .setting.aligned.source-row {
    grid-template-columns: 6.5rem max-content max-content;
  }
  div#wrapper select {
    width: 8rem;
    height: 2rem;
    box-sizing: border-box;
  }
  .setting.aligned.source-row button {
    height: 2rem;
    box-sizing: border-box;
  }
  div#wrapper {
    border: 2px solid var(--highlight-color);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }
  .readout {
    font-family: monospace;
    font-size: 0.9rem;
    margin: 0.5rem 0 0 1rem;
    white-space: pre;
    overflow-x: auto;
  }
</style>
