<script>
  import kofi from '$lib/assets/KoFi.png'
</script>

<h1>About Relative Notes</h1>
<p>
  <a href="/">Back to App</a>
</p>

<p>
  <strong>Relative Notes</strong> is a web app for musical training using Solfège,
  Nashville or Roman numbering. Ear training or learning tunes, for example, work
  best using one of these relative symbol systems. Each note is given a symbol (Re,
  2 or ii) to identify its distance from a tonic note as apposed to using fixed pitch
  musical note names (D). Then the pitches can be more easily applied in any Key.
</p>
<p>
  The app monitors MIDI 'noteon' messages coming from external or virtual MIDI
  devices and displays the appropriate syllable or number. It also display some
  extra detail.
</p>
<p>
  The original use case was to confirm the relative syllable or number in mind
  matches what is being played. You can even check what is being sung when used
  in conjunction with a Pitch to MIDI converter such as <a
    href="https://vochlea.com/">Dubler</a
  >.
</p>
<p>
  Note that when MIDI devices are connected or virtual midi programs launched
  the browser will likely need to be refreshed (F5) or restarted in order for
  them to become available.
</p>
<p>
  When using virtual MIDI devices (programs that generate MIDI) on Windows you
  might need a virtual MIDI cable such as <a
    href="https://www.tobias-erichsen.de/software/loopmidi.html">loopMidi</a
  >.
</p>

<p>
  This is a Music Practice Tools <a
    href="https://github.com/music-practice-tools/relative-notes"
    >open source project</a>
  by Steve Lee for <a href="https://blog.fullmeasure.uk">Fullmeasure.uk</a>.
</p>

<a
  href="https://ko-fi.com/T6T3OX3K9"
  target="_blank"
  ><img
    height="36"
    style="border: 0px; height: 36px"
    src={kofi}
    alt="Support Steve at ko-fi.com" /></a>
