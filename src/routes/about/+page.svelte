<script>
  import kofi from '$lib/assets/KoFi.png'
</script>

<h1>About Relative Notes</h1>
<p>
  <a
    href="/"
    data-sveltekit-reload>Back to App</a>
</p>
<p>
  <strong>Relative Notes</strong> is a web app for musical relative pitch training
  with Solfège, Nashville or Roman numbering. Ear training or learning tunes often
  work best using one of these relative symbol systems. Each note is given a symbol
  (Re, 2 or ii) to identify its distance from a tonic note as apposed to using fixed
  pitch musical note names (D). Using these scale functions means the pitches can
  be more easily recognised, sung and applied in any Key.
</p>
<p>
  Here's a short <a href="https://www.youtube.com/watch?v=CsQQuxrUV9E)"
    >demo video</a>
  and my
  <a href="https://blog.fullmeasure.uk/2024/04/25/relative-notes-tool/"
    >blog post</a> about it.
</p>
<p>
  The app monitors MIDI 'noteon' messages coming from external or virtual MIDI
  devices and displays the appropriate syllable or number. It also shows the
  notes on an <a href="https://improviseforreal.com/">Improvise for Real</a> tonal
  map diagram as well as some extra detail on the input note. The current note can
  be set as the tonic and then future notes will be relative to that.
</p>
<h2>Sung Pitch recognition with Dubler 2</h2>
<p>
  I originally created Relative-Notes due to the lack of pitch that handle
  relative pitch. Specifically, as I worked on ear training I wanted something
  to confirm the scale functions I sang were as expected. Due to the lacks of
  good voice pitch recognition components for web apps I used the excellent <a
    href="https://vochlea.com/">Dubler</a> Pitch to MIDI converter as source for
  a MIDI app.
</p>
<p>
  Start Dubler first and then select it as the MIDI source in the web app. I
  found lowering the Dubler 'Stickiness' setting gives better results as my
  pitch varies as I sing a note. Also select 'C' and Chromatic in the Play tab.
</p>
<h2>Usage Notes</h2>
<p>
  You will need to enable MIDI access for the browser when asked. In addition,
  when MIDI devices are connected or virtual midi programs launched the browser
  will likely need to be refreshed (F5) or restarted in order for them to become
  available snd work.
</p>
<p>
  Dubler is directly selectable as the MIDI source on Mac but When using such
  virtual MIDI devices (programs that generate MIDI) on Windows you might need a
  virtual MIDI cable such as <a
    href="https://www.tobias-erichsen.de/software/loopmidi.html">loopMidi</a
  >. Maybe the upcoming MIDI 2.0 support in Windows will fix this?
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
