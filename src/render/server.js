import { Document } from 'uhtml/dom'
import init from 'uhtml/init'
import { css, raw, classify } from './shared.js'

const { Hole, render, html, svg, htmlFor, svgFor, attr } = init(document)


export { 
  html, svg, htmlFor, svgFor, render,
  css, raw, classify
}