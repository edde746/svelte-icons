<script>
  export let title = null;
  export let viewBox;
</script>

<svg xmlns="http://www.w3.org/2000/svg" {viewBox} {...$$props}>
  {#if title}
    <title>{title}</title>
  {/if}
  <slot />
</svg>

<style>
  svg {
    stroke: currentColor;
    fill: currentColor;
    stroke-width: 0;
  }
</style>
