# zilk

light & flexible web framework

---

> [!WARNING]  
> zilk is actively being built out. It's functional and used on [m4r.sh](https://m4r.sh) and [mfers.lol](https://mfers.lol), but it's not ready for public adoption. 

<p align="center">
  <img width="600" height="400" src="https://m4r.sh/previews/zilk-tech.gif">
</p>

---

# Overview

zilk is an attempt to simplify web development without sacrificing freedom. Like silk, it should be flexible, almost invisible, and structurally sound.

It's split into two libraries:

## `zilk` (runtime)
  - **Render HTML**: DOM + SSR tagged template rendering from [`uhtml`](https://github.com/WebReflection/uhtml) and [`uhtml-ssr`](https://github.com/WebReflection/uhtml-ssr)
  - **Hydration**: class-based event handlers from [`wicked-elements`](https://github.com/WebReflection/wicked-elements)
  - **Navigation**: on-page navigation helper (code started as a fork from [`navaid`](https://github.com/lukeed/navaid))
  - **Router**: Fetch handler to serve SSR Responses from Bun, Node, or Workers

## `zilker` (build tool)
  - **File-based**: Intuitive project organization
  - **Powered by [Bun](https://bun.sh/)**: Fast by default
  - **Plugin-friendly**: Custom dev experience and build settings

---

# Usage

### Example UI Component

1. Render function (HTML)
2. handlers (JS)
3. style (CSS)

> At build time, each export is handled differently. All handlers are bundled into a hydration script, all styles are bundled into a CSS stylesheet, and the render functions are bundled with the browser-side router. Server-side rendering only requires the render function, which is the default export.

~~~js
// views/Example.js
import { html, css, classify } from 'zilk'

const { TITLE, BUTTON } = classify('Example')

// 1. Render function (used for SSR and browser rendering)
export default ({
  title="Default Title",
  btn_href="https://github.com/m4r-sh/zilk",
  btn_label="Zilk Docs"
}={}) => html`
  <h1 class=${TITLE}>${title}</h1>
  <a class=${BUTTON} href=${btn_href}>
    <span class=${BUTTON.LABEL}>
      ${btn_label}
    </span>
  </a>
`

// 2. Class-based event handlers, auto-attached on browser
export let handlers = {
  [BUTTON]: {
    init(){
      console.log('Runs once per element')
    },
    onclick(event){
      console.log('Click event')
    }
  }
}

// 3. Class-based CSS styles - extracted at build time
export let style = () => css`
  .${TITLE}{
    font-size: 3rem;
    color: #555;
  }
  .${BUTTON}{
    padding: 1rem 0.5rem;
    background: #000;
  }
  .${BUTTON.LABEL}{
    color: #fff;
  }
`

~~~

<details>
<summary>Why <code>classify?</code></summary>
<p>Classes are the glue that connects the HTML, CSS, and javascript event handlers.</p>
<p>You could also use normal strings, but manually managing string names is notoriously problematic.</p>
<p><code>classify()</code> automatically scopes nested css classnames, so you don't have to write long unique strings across files. It's recommended to pass a string that mirrors the file path.
<pre lang="javascript" class="language-javascript">
<code>// views/Nav/Button.js
let { OUTER, INNER, LABEL, ICON } = classify('Nav/Button')

OUTER // "Nav-Button__OUTER"
LABEL // "Nav-Button__LABEL"</code>
</pre>

<p><b>How? </b>classify returns a recursive proxy with a toString() and [Symbol.toPrimitive]() trap. Each layer adds to the original prefix in the output string.
</details>

### Environment Setup

1. Install BunJS [[bun.com]](https://bun.com)
2. Install syntax highlighter [[VSCode]](https://marketplace.visualstudio.com/items?itemName=m4rsh.zilk-highlight) [[TextMate Grammar]](https://github.com/m4r-sh/vscode-zilk-highlight/blob/master/syntaxes/zilk.tmLanguage.json)
3. Install `zilker` globally: `bun i -g zilker`
4. Open a new folder and run `zilker setup`
5. Edit with `zilker dev`
6. Build for prod with `zilker build <target?>`

---

# Exports

### [`zilk/dom`](https://github.com/m4r-sh/zilk/blob/master/src/dom.js) **(3.8 kB)**

main export from `zilk` for rendering on the browser

### [`zilk/ssr`](https://github.com/m4r-sh/zilk/blob/master/src/ssr.js) **(2.2 kB)**

main export from `zilk` for server-side rendering on Bun, Workers, NodeJS

### [`zilk/hydrate`](https://github.com/m4r-sh/zilk/blob/master/src/hydrate/index.js) **(1.8 kB)**

Ideal exports for generating a hydration script (`hydrate.js`)

### [`zilk/nav`](https://github.com/m4r-sh/zilk/blob/master/src/nav/index.js) **(1.6 kB)**

Ideal export for generating a client-side routing script (`nav.js`)

### [`zilk/fetch`](https://github.com/m4r-sh/zilk/blob/master/src/fetch/index.js) **(3.2 kB)**

Ideal export for generating a server-side request handler

---

# Credits

The performance of `zilk` is largely due to [@WebReflection's](https://github.com/WebReflection/) incredible work on [`uhtml`](https://github.com/WebReflection/uhtml), [`wicked-elements`](https://github.com/WebReflection/wicked-elements), and other top-tier JS libraries.

Credit to [`navaid`](https://github.com/lukeed/navaid/) for simple client-side navigation logic, and to [`itty-router`](https://itty.dev/itty-router) for minimal route matching.

The developer experience is inspired by Next.js, Svelte, Astro, and other great tools I've used over the years. The JavaScript ecosystem is bustling with innovation, but the overwhelming complexity makes it difficult to leverage these tools without getting stuck.