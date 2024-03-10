import { Document } from 'uhtml/dom'
import init from 'uhtml/init'
import { css, raw, classify } from './shared.js'


const doc = new Document
const { Hole, render, html, svg, htmlFor, svgFor, attr } = init(doc)


export { 
  html, svg, htmlFor, svgFor, render,
  css, raw, classify, Document
}