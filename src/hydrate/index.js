import { define, defineAsync } from 'wicked-elements'

let toQuery = x => x && x[Symbol.toStringTag] === 'classified' ? '.'+x : x

const normalize=o=>({
  ...o,
  $(x){ return this.element.querySelector(toQuery(x)) },
  $$(x){ return [...this.element.querySelectorAll(toQuery(x))] },
  init(){
    this.el = this.element
    if(o.init && typeof o.init == 'function'){
      o.init.apply(this,[])
    }
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