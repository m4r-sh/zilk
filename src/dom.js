import { Hole, html, svg, htmlFor, svgFor, render } from 'uhtml/keyed'
import { classify, dedent, plain } from './_render-utils.js'

const raw = new Proxy(plain,{ get: (_,k) => (...args) => new Hole(plain(...args)) })
const fmt = new Proxy(dedent,{ get: (_,k) => (...args) => new Hole(dedent(...args)) })
const { css, md, glsl } = fmt

export { 
  html, svg, htmlFor, svgFor, render,
  raw, fmt, css, md, glsl, classify, Hole
}