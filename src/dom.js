import { Hole, html, svg, htmlFor, svgFor, render } from 'uhtml/keyed'
import { classify, fmt as _fmt, plain } from './_render-utils.js'

const raw = new Proxy(plain,{ get: (_,k) => (...args) => plain(...args) })
const fmt = new Proxy(_fmt,{ get: (_,k) => (...args) => _fmt(...args) })
const { css, md, glsl } = fmt

export { 
  html, svg, htmlFor, svgFor, render,
  raw, fmt, css, md, glsl, classify, Hole
}
