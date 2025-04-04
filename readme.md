# zilk

light & flexible web framework

---

> **Note**: zilk is actively being built out. It's functional and is used on [m4r.sh](https://m4r.sh) and [stabilimentum.com](https://stabilimentum.com), but it's not ready for public adoption. 

---

# Overview

zilk is an attempt to simplify web development without sacrificing freedom. Like spider silk, it should be flexible, almost invisible, and structurally sound. It's a developer-friendly integration of core abstractions; it's not a new primitive.

It's split into two libraries:

## `zilk` (runtime)
  - **UI**: tagged template rendering (from [`uhtml`](https://github.com/WebReflection/uhtml)) & class-based event handlers (from [`wicked-elements`](https://github.com/WebReflection/wicked-elements))
  - **Data**: reactive objects (from [`orbz`](https://github.com/m4r-sh/orbz))

[**Docs**](https://github.com/m4r-sh/zilk/tree/main/docs)

## `zilker` (build tool)
  - **File-based**: Intuitive project organization
  - **Powered by [Bun](https://bun.sh/)**: Fast by default
  - **Plugin-friendly**: Custom dev experience and build settings

[**Docs**](https://github.com/m4r-sh/zilker)

---

# Usage

### Example UI Component

1. Render function (HTML)
2. handlers (JS)
3. style (CSS)

> At build time, each export is handled differently. All handlers are bundled into a hydration script, all styles are bundled into a CSS stylesheet, and the render functions are bundled with the browser-side router. Server-side rendering only requires the render function, which is the default export.

```js
// views/Example.js
import { html, css, classify } from 'zilk'

let { TITLE, BUTTON } = classify('Example')

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
      console.log('Button initialized')
    },
    onclick(event){
      console.log('Button click')
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

```

---

# Credits

The performance of `zilk` is largely due to [@WebReflection's](https://github.com/WebReflection/) incredible work on [`uhtml`](https://github.com/WebReflection/uhtml), [`wicked-elements`](https://github.com/WebReflection/wicked-elements), and other top-tier JS libraries. He's a JavaScript legend. 

Credit to [navaid](https://github.com/lukeed/navaid/) by [@lukeed](https://github.com/lukeed) for simple browser routing logic.

The developer experience is inspired by Next.js, Svelte, Astro, and other great tools I've used over the years. The JavaScript ecosystem is bustling with innovation, but the overwhelming complexity makes it difficult to leverage these tools without getting stuck.