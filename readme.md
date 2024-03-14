<p align="center">
  <a href="https://bun.sh"><img src="https://raw.githubusercontent.com/m4r-sh/zilk/main/docs/zilk-sticker.png" alt="Logo" height=170></a>
</p>
<h1 align="center">zilk</h1>
<h3 align="center">light & flexible web framework</h3>

---

> **Note**: zilk is actively being built out. It's functional and is used on [m4r.sh](https://m4r.sh) and [stabilimentum.com](https://stabilimentum.com), but it's not ready for public adoption yet. 

---

# Overview

zilk is an attempt to simplify web development without sacrificing freedom. Like spider silk, it should be flexible, almost invisible, and structurally sound. It's a developer-friendly integration of core abstractions; it's not a new primitive.

It's split into two libraries:

## `zilk` (runtime)
  - **UI**: template literal rendering (powered by `uhtml`) & class-based event handlers (powered by `wicked-elements`)
  - **Data**: reactive objects (powered by `orbz`)

[zilk API docs](https://github.com/m4r-sh/zilk/tree/main/docs)

## `zilker` (build tool):
  - **File-based**: Intuitive project organization
  - **Powered by [Bun](https://bun.sh/)**: Fast by default
  - **Plugin-friendly**: Custom dev experience and build settings

[zilker GitHub page](https://github.com/m4r-sh/zilker)

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

let { CONTAINER, TITLE, BUTTON } = classify('Example')

// 1. Render function (used for SSR and in-browser rendering)
export default ({
  title="Default Title",
  btn_href="https://github.com/m4r-sh/zilk",
  btn_label="Zilk Docs"
}={}) => html`
  <div class=${CONTAINER}>
    <h1 class=${TITLE}>${title}</h1>
    <a class=${BUTTON} href=${btn_href}>
      <span class=${BUTTON.LABEL}>
        ${btn_label}
      </span>
    </a>
  </div>
`

// 2. Class-based event handlers, auto-attached on browser
export let handlers = {
  [BUTTON]: {
    init(){
      console.log('Button initialized')
    },
    onmouseover(){
      console.log('Button hover')
    },
    onclick(event){
      console.log('Button click')
    }
  }
}

// 3. Class-based CSS styles - extracted at build time
export let style = () => css`
  .${CONTAINER}{
    text-align: center;
    width: 100%;
    max-width: 40rem;
    margin: 4rem auto;
  }
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

### Example Model

> Models are specialized prototypes that allow for reactivity with minimal overhead. They're like classes, but defined by object literals. Derived values (marked by `get` prefixes) are only updated when their accessed values change (and only if they're being observed). Effects keep track of accessed properties, and the effect is re-run when any of those properties update. Updates are batched intelligently, so cascading updates don't cause duplicated effects.

```js
// models/index.js
import { Model } from 'zilk'

export const Counter({
  count: 0,
  multiplier: 1,
  inc(){
    this.count++
  },
  dec(){
    this.count--
  },
  get total(){
    let { count, multiplier } = this
    return count * multiplier
  } 
})
```

---

# Credits

The performance of `zilk` is largely due to [@WebReflection's](https://github.com/WebReflection/) incredible work on [`uhtml`](https://github.com/WebReflection/uhtml), [`wicked-elements`](https://github.com/WebReflection/wicked-elements), and other top-tier JS libraries. He's a JavaScript legend. 

Credit to [navaid](https://github.com/lukeed/navaid/) by [@lukeed](https://github.com/lukeed) for simple browser routing logic.

The developer experience is inspired by Next.js, Svelte, Astro, and other great tools I've used over the years. The JavaScript ecosystem is bustling with innovation, but the overwhelming complexity makes it difficult to leverage these tools without getting stuck.