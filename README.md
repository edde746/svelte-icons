# svelte-icons

The best svelte icon library.

## Installation

Recommended: install with alias:
```
npm i svelte-icons@npm:@edde746/svelte-icons
```
or without alias:
```
npm i @edde746/svelte-icons
```

## Notice

Add the following to your `svelte.config.js` if you are having errors:
```js
const config = {
  kit: {
    vite: {
      ssr: {
        noExternal: ['svelte-icons'], // @edde746/svelte-icons if not using alias
      },
    },
  },
}
```