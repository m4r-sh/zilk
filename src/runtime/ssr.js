import { html, svg, render, foreign, Hole } from 'uhtml-ssr'
import { classify, dedent, plain } from './shared.js'


const raw = new Proxy(plain,{ get: (_,k) => (...args) => new Hole(plain(...args)) })
const fmt = new Proxy(dedent,{ get: (_,k) => (...args) => new Hole(dedent(...args)) })
const { css, md } = fmt

const htmlFor = html
const svgFor = svg

export { 
  html, svg, htmlFor, svgFor, render,
  raw, fmt, css, md, classify, Hole
}