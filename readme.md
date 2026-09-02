<div align="center">
  <img src="docs/media/icon.webp" alt="zilk" width="160px" height="160px" />
</div>

<h1 align="center">zilk</h1>

<div align="center">lightweight web framework</div>

<br/>

---

## Motivation

zilk is designed for authoring isomorphic web components (just like React, Svelte, Vue, etc).

*So what's different?*

UI components are defined **in pure javascript** with **colocated definitions**.

zilk is not feature-rich. Instead of learning new API's and syntax, it should feel like writing vanilla HTML, CSS, and JavaScript. No JSX, no DSL's, just tagged template literals.

By separting our handlers, styles, and markup into different exported functions, we can see all of the behavior in one file, while our build process can extract them as needed.

## How it works

zilk was designed in tandem with `zilker`.

zilk provides the runtime essentials for isomorphic rendering, scoped classnames, and utilities for ssr routing, hydration, and client-side navigation.

zilker is the recommended tool for transforming zilk components into complete webpages with all of the necessary output files.

---

# Exports

### [`zilk/dom`](https://github.com/m4r-sh/zilk/blob/master/src/dom.js) 

main export from `zilk` for rendering on the browser

### [`zilk/ssr`](https://github.com/m4r-sh/zilk/blob/master/src/ssr.js) 

main export from `zilk` for server-side rendering on Bun, Workers, NodeJS

### [`zilk/hydrate`](https://github.com/m4r-sh/zilk/blob/master/src/hydrate/index.js) 

Ideal exports for generating a hydration script (`hydrate.js`)

### [`zilk/nav`](https://github.com/m4r-sh/zilk/blob/master/src/nav/index.js) 

Ideal export for generating a client-side routing script (`nav.js`)

### [`zilk/navigation`](https://github.com/m4r-sh/zilk/blob/master/src/navigation/index.js)

Experimental client-side routing built on the browser Navigation API

### [`zilk/fetch`](https://github.com/m4r-sh/zilk/blob/master/src/fetch/index.js) 

Ideal export for generating a server-side request handler

---

# Credits

The performance of `zilk` is largely due to [@WebReflection's](https://github.com/WebReflection/) incredible work on [`uhtml`](https://github.com/WebReflection/uhtml), [`wicked-elements`](https://github.com/WebReflection/wicked-elements), and other top-tier JS libraries.

Credit to [`navaid`](https://github.com/lukeed/navaid/) for simple client-side navigation logic, and to [`itty-router`](https://itty.dev/itty-router) for minimal route matching.
