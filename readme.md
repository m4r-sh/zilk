# zilk

lightweight & flexible web architecture

---

> **Note**: zilk is actively being built out. It's functional and is used on [m4r.sh](https://m4r.sh) and [stabilimentum.com](https://stabilimentum.com), but it's not ready for public adoption yet. 

---

# Overview

zilk is an attempt to reduce the complexity of web development tooling to its simplest form without sacrificing freedom.

Like spider silk, it should be flexible, almost invisible, and structurally sound.

It's a developer-friendly integration of a few core abstractions; it's not a new primitive.

Runtime (`zilk`):
- **UI**: template literal rendering (powered by `uhtml`)
- **Data**: reactive objects (powered by `orbz`)
- **Flows**: iterative transforms (coming soon)
- Isomorphic: runs in browsers, Bun, Node.js, workers

Build time (`zilker`):
- File-based: Intuitive project organization
- Powered by Bun: Fast by default
- Plugin-friendly: Tailored dev experience and build settings

---

# API

## `zilk`

### html, svg

Tagged template literals to render HTML and SVG content. See `uhtml` for more details.

**Browsers**: Exports from `uhtml`
**Bun/Node.js/Workers**: Exports from `uhtml/dom`

### css

Tagged template literal for rendering CSS. Doesn't transform the string, but it allows for syntax highlighting.

### raw

Tagged template literal for arbitrary strings. It also provides proxied access to itself to self-document the content type. `raw.xml\`\``, `raw.md\`\``, etc

### render(where, what)

Render `html` and `svg` templates to a DOM. Optimizations are done by `uhtml` under the hood to maximize performance.

**Browsers**: `where` should be a DOM element.
**Bun/Node.js/Workers**: `where` should be a mocked DOM element. Use `Document` to accomplish this. `Document` is only exported to the server-side runtime.

### classify(id)

*Returns*: specialized string proxy that outputs class names to avoid name-clashing

Classify should be called once per UI component file, and the id should be unique for the project. 

```js
import { classify } from 'zilk'

let { CONTAINER, BUTTON } = classify('Example')

console.log(`${CONTAINER} ${BUTTON} ${BUTTON.LABEL}`)
// ~> "Example__CONTAINER Example__BUTTON Example__BUTTON__LABEL"
```

### Model(definition)

*Returns*: Constructor that produces `Orbs` with defined prototype. See `orbz` for more details.

### Orb(definition)

*Returns*: One-off reactive object based on the defined prototype. See `orbz` for more details.

## `zilk/hydrate`

Docs coming soon

## `zilk/router`

Docs coming soon

---

# Examples

Coming soon

---

# Credits

The performance of `zilk` is largely due to @WebReflection's incredible work on `uhtml`, `wicked-elements`, and other top-tier JS libraries. He's a JavaScript master and understands the nitty-gritty details of browser performance.

The developer experience is inspired by Next.js, Svelte, Astro, and other great tools I've used over the years. The JavaScript ecosystem is bustling with innovation, but the overwhelming complexity makes it difficult to leverage these tools without getting stuck.