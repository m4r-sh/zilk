# viewz

Simple UI components

## Overview

1. Flexible build options
2. Pure JavaScript (no DSL)
3. Isomorphic by default
4. Automatic reactivity
5. Performant

## Runtime

`html, svg, css, raw, raw.js, raw.md, raw.sass`: tagged template literals for rendering

`classify`: simple classname solution

`render`: place HTML/SVG content in the DOM

`saturate`: hydrate a render with a `handlers` object (can inline)

`saturateAsync`: define hydration `handlers` imports that "define" when fetch is complete

`saturateLazy`: define hydration `handlers` imports for whenever externally added

`routeTo(href)`: replaces <a> clicks

`registerRoutes({ [href]: {...} })`: define pages that can be navigated to on client side

`preload(href)`: loads dependencies of page before navigation to improve speed