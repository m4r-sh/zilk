import { define, defineAsync } from 'wicked-elements'

let toQuery = x => x && x[Symbol.toStringTag] === 'classified' ? '.'+x : x

// idea: handle $attr
// TODO: logic that connects ssr orbs
// 1. Edit uhtml-ssr/utils.js:103 to check value of `.name=value` for orb. if orb, encode `data-z-name="UID"`
// 2. Edit init() to scan dataset for `z-` prefixed pairs.
// 3. Find the value from the window dictionary - assign value directly to `this` with key `name`
// https://docs.w3cub.com/dom/htmlelement/dataset
const normalize=o=>({
  ...o,
  $(x){ return this.element.querySelector(toQuery(x)) },
  $$(x){ return [...this.element.querySelectorAll(toQuery(x))] },
  init(){
    this.el = this.element
    for(let k in this.element.dataset){
      if(k.startsWith('z') && k[1].toUpperCase() == k[1]){
        let key = k[1].toLowerCase() + k.toString(2) // local orb name
        let val = this.element.dataset[k] // global orb ID
        this[key] = 'test' //TODO: zilk_global.orb[val]
        // TODO: check for invalid values. don't wanna allow malicious keys
        // OR: only allow this at ssr and initial hydration. direct setting works properly
        // when rendered client-side automatically
      }
    }
    o.init.apply(this,[])
  }
})

export function saturateAsync(locations){
  for(let k in locations){
    defineAsync('.'+k, () => 
      locations[k]().then(mod => ({
        default: normalize(mod.handlers[k])
      }))
    )
  }
}

export function saturate(definitions){
  for(let k in definitions){
    define('.'+k, normalize(definitions[k]))
  }
}