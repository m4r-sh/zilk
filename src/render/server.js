// import { Document } from 'uhtml/dom'
import { html, svg, render, foreign, Hole } from 'uhtml-ssr'
// import init from 'uhtml/init'
import { classify } from './shared.js'


const plain = function(t){
  if(typeof t === 'string'){
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length; i < l; i++)
    s += arguments[i] + t[i];
  return new Hole(s);
}

const raw = new Proxy(plain,{
  get(_,k){
    let f = plain.bind(null)
    f.lang = k
    return f
  }
})
const css = raw.css
// const doc = new Document
// const { render, html, svg, htmlFor, svgFor } = init(doc)

const htmlFor = html
const svgFor = svg

export { 
  html, svg, htmlFor, svgFor, render,
  css, raw, classify, foreign, Hole
}