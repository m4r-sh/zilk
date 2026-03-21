import { html, svg, render, Hole } from 'uhtml-ssr'
import { classify, fmt as _fmt, plain } from './_render-utils.js'

const raw = new Proxy(plain,{ get: (_,k) => (...args) => new Hole(plain(...args)) })
const fmt = new Proxy(_fmt,{ get: (_,k) => (...args) => new Hole(_fmt(...args)) })
const { css, md, glsl } = fmt

const htmlFor = html
const svgFor = svg

export { 
  html, svg, htmlFor, svgFor, render,
  raw, fmt, css, md, glsl, classify, Hole
}
