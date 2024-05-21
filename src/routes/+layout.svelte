<slot />

<style>
  :global(:root) {
    --background-color: #242424;
    --color: #ffffff;
    --highlight-color: lightblue;
    --link-color: #858bff;
    background-color: var(--background-color);
    color: var(--color);
    font-family: Sans-Serif;
    color-scheme: light dark;
  }

  @media (prefers-color-scheme: light) {
    :global(:root) {
      --background-color: #ffffff;
      --color: #242424;
      --highlight-color: darkblue;
    }
  }
</style>
