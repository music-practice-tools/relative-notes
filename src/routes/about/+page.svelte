<script>
  import { browser } from '$app/environment'
</script>

<h1>About</h1>
<p>
  <a href="/">Home</a>
</p>

<p>
  Relative Notes is a tool to support ear training using Solfège, Nashville or
  Roman numbering.
</p>
<p>
  It monitors MIDI notes coming from external or virtual MIDI devices and
  displays the syllable or number for the distance of the note from the selected
  major scale tonic.
</p>
<p>
  The main use case is to confirm the correct syllable is being sung when used
  in conjunction with a Pitch to MIDI converter such as <a
    href="https://vochlea.com/">Dubler</a
  >.
</p>

<p>
  This is a Music Practice Tools <a
    href="https://github.com/music-practice-tools/relative-notes"
    >open source project</a>
  by Steve Lee for <a href="https://blog.fullmeasure.uk">Fullmeasure.uk</a>.
</p>

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

{#if browser}
  <script
    src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"></script>
  <script>
    kofiWidgetOverlay.draw('stevelee1084', {
      type: 'floating-chat',
      'floating-chat.donateButton.text': 'Support me',
      'floating-chat.donateButton.background-color': '#794bc4',
      'floating-chat.donateButton.text-color': '#fff',
    })
  </script>
{/if}
