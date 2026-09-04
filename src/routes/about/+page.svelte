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
  <strong>Relative Notes</strong> is a web app for recognising the scale degree of a sung or MIDI note.</p>
<p>A scale degrees is the musical distance or 'interval' from a refetence 'tonic' note (root) and so a relative naming scheme, compared to absolute note names like 'C'.
</p>
<p>This alows easy transposing between keys. It also aids ear training as the 'feel' of each degree can be learnt. The degrees can be displayed in Arabic or Roman numbers and solfege and Solfège or Sargam syllables.
</p>
<p>
  Here's a short <a href="https://www.youtube.com/watch?v=CsQQuxrUV9E)"
    >demo video</a>
  and my
  <a href="https://blog.fullmeasure.uk/2024/04/25/relative-notes-tool/"
    >blog post</a> about it.
</p>
<p>
  The app monitors notes sung into a microphone or MIDI 'noteon' messages coming
  from external or virtual MIDI devices. It then displays the appropriate
  syllable or number for the nore relative to a tonic note. It also shows the
  (major) scale functions on an <a href="https://improviseforreal.com/"
    >Improvise for Real</a> tonal map diagram as well as some extra detail on the
  input note. The current note can be set as the tonic and then future notes will
  be relative to that.
</p>
<h2>Sung Pitch recognition</h2>
<p>
  I originally created Relative-Notes due to the lack of tools that handle
  relative pitch for ear training. Specifically, I wanted something to confirm
  the scale functions I sang were as expected.
</p>
<p>
  There is a built in pitch converter that works fairly well. or your can use
  something like the excellent <a href="https://vochlea.com/">Dubler</a> Pitch to
  MIDI converter as source.
</p>
<h2>Usage Notes</h2>
<p>
  You will need to enable microphone or MIDI access for the browser when asked.
  In addition, when MIDI devices are connected or virtual midi programs launched
  the browser will likely need to be refreshed (F5) or restarted in order for
  them to become available snd work. Sometimes you may need to use browser
  controls to reset the mic or midi access so you can select another source.
</p>
<p>
  When using such virtual MIDI devices (programs that generate MIDI) on Windows
  you might need a virtual MIDI cable such as <a
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
