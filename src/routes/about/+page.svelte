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
  <strong>Relative Notes</strong> is a web app for recognising the scale degree of a sung note or a MIDI note on message.</p>
<p>A scale degree (AKA scale function) is the musical distance or 'interval' of a note from a reference 'tonic' note (root) of a scale. This is a relative naming scheme, compared to absolute note names like 'C'. Scale degrees of single notes here are closely related to chord function as those are defined by the chord root note.
</p>
<p>Using scale degrees aids ear training as the 'feel' of each degree can be learnt. It also alows easy transposing between keys of a melody or harmony. 
</p>
<p>
The app shows the currently detected scale degree as Arabic numbers, Roman numbers, Solfège or Sargam syllables.
</p>
<p>
  Here's a short <a href="https://www.youtube.com/watch?v=CsQQuxrUV9E)"
    >demo video</a>
  and my
  <a href="https://blog.fullmeasure.uk/2024/04/25/relative-notes-tool/"
    >blog post</a> about it.
</p>
<p>
  The app monitors notes sung into a microphone or MIDI 'noteon' messages
  from external or virtual MIDI devices. It then displays the appropriate
  number or syllable relative to the selected tonic. It also shows the degree on an <a href="https://improviseforreal.com/"
    >Improvise for Real</a> tonal map diagram as well as some extra detail on the
  current note. The current note can be set as the tonic and future notes will
  be relative to that.
</p>
<h2>Sung Pitch recognition</h2>
<p>
  I created Relative-Notes due to the lack of tools that handle
  relative pitch for ear training. Specifically, I wanted something to confirm
 that the scale functions I sang were as expected.
</p>
<p>
  The built in pitch converter works well or your can use
  something like the excellent <a href="https://vochlea.com/">Dubler</a> Pitch to
  MIDI converter as source.
</p>
<h2>Usage Notes</h2>
<p>
You will need to enable microphone or MIDI access for the browser when asked.
</p>
<p>
  In addition, when new microphones or MIDI devices are connected or virtual midi programs launched
  the browser will likely need to be refreshed (F5) or even restarted in order for
  them to become available for selection. Sometimes you may need to use browser
  controls to reset the mic or midi access so you can select another source.
</p>
<p>
A quiet room and good mic will give best results. some laptop mics can give poor results.
</p>
<p>
  When using virtual MIDI devices (programs that generate MIDI) on Windows
  you might need a virtual MIDI cable such as <a href="https://www.tobias-erichsen.de/software/loopmidi.html">loopMidi</a
  >. Maybe the upcoming MIDI 2.0 support in Windows will fix this?
</p>
<h2>Limitation</h2>
<p>
<ul>
<li>Major scale only</li>
<li>Non diatonic notes are shown as flat (b)</li>
<li>MIDI is polyphonic and chords show notes in rapid succession as they are received. Microphone is monophonic.</li>
<\ul>
Major
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
