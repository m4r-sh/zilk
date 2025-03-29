import { Hole, html, svg, htmlFor, svgFor, render } from 'uhtml/keyed'

const plain = function(t){
  if(typeof t === 'string'){
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length; i < l; i++)
    s += arguments[i] + t[i];
  return s;
}

export const raw = new Proxy(plain,{
  get(_,k){
    let f = plain.bind(null)
    f.lang = k
    return f
  }
})
export const css = raw.css

export { classify } from './shared.js'
export { html, svg, htmlFor, svgFor, render, Hole } 