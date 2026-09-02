<div align="center">
  <img src="docs/media/icon.webp" alt="zilk" width="160px" height="160px" />
</div>

<h1 align="center">zilk</h1>

<div align="center">lightweight web framework</div>

<br/>

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
