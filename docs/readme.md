# zilk docs

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

Tagged template literal for arbitrary strings. It also provides proxied access to itself to self-document the content type. `raw.xml`,`raw.md`, etc

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

---

## `zilk/hydrate`

Docs coming soon

---

## `zilk/router`

Docs coming soon

---