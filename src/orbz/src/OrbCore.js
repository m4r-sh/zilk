let entry_count = 0
let get_stack = []
let curr_get = null

let prefix = ''

function isLink(){

}
// TODO: create priority subs that can only be called by internal
// TODO: return proxys for orbs that dispatch priority subs to update state
// prefix system doesn't work for destructuring :///
// might have to have a prefix stack to remember destructure within a function.
// ratchet af, but less overhead than a proxy

export const $Z = Symbol('orbz-core')

// option 1: recursive, reference based rules
// option 2: global reference that dispenses secret symbols to retrieve permanently stored context
// --> option 2 allows for better storage, undo/redo, 

export class OrbCore {
  #models = {}
  #state = {}
  #orbs = {}
  #changed = new Set()
  #cache = {}
  #valid = {}
  #getters = {}
  #entrypoints = {}
  #this_orb
  #subs = new Map()
  #dep_graph = {}
  #get_watchlists = {}
  #link_graph = {}
  constructor(defs,state,this_orb){
    this.#this_orb = this_orb
    this.#models = defs.orbs
    
    for (const key in defs.state) {
      this.#dep_graph[key] = new Set()
      this.set_state(key,(key in state) ? state[key] : defs.state[key])
    }
    for(const key in defs.orbs){
      this.#dep_graph[key] = new Set()
      this.set_orb(key,state[key])
    }

    for(const key in defs.entry){
      this.#entrypoints[key] = defs.entry[key].bind(this.#this_orb)
    }

    for(const key in defs.derived){
      this.#dep_graph[key] = new Set()
      this.#get_watchlists[key] = new Set()
      this.#getters[key] = defs.derived[key].bind(this.#this_orb)
    }

    for(const key in defs.getset){
      this.#dep_graph[key] = new Set()
      this.#get_watchlists[key] = new Set()
      this.#getters[key] = defs.getset[key].get.bind(this.#this_orb)
      this.#entrypoints[key] = defs.getset[key].set.bind(this.#this_orb)
    }

  }

  add_link(k,options){
    console.log('link ' + k)
    
    let link_set = this.#link_graph[k]
    
    return (external_cb) => {
      link_set.add(external_cb)
      return () => {
        console.log('remove link')
        link_set.delete(external_cb)
      }
    }
    
  }

  add_sub(cb,watchlist){
    this.#subs.set(cb,null)
    return () => {
      this.#subs.delete(cb)
    }
  }

  get_state(k){
    if(!k.startsWith('_') || this.#isLocal()){
      this.#watch_get(k)
      return this.#state[k]
    }
  }

  set_state(k,v){
    //todo: handle setting a link
    if(!k.startsWith('_') || this.#isLocal()){
      if(v != this.#state[k]){
        this.#state[k] = v
        this.#invalidate(k,true)
        this.#flush()
      }
    }
  }

  get_derived(k){
    if(!k.startsWith('_') || this.#isLocal()){
      this.#watch_get(k)
      const prev = curr_get
      let res
      curr_get = this
      try{
        res = this.#derived_value(k)
        // TODO: test typeof res == 'function'
        // if so, it should be wrapped such that original parameters
        // are remembered, and re-ran when accessed keys are invalidated
        // --> only if accessed within an effect or as a link
        // ex: get pointAtPercent(){ return (percent) => { this.evalCurve(percent * this.arclen) } }
      } finally{
        curr_get = prev
      }
      return res
    }
  }

  run_entrypoint(k,args){
    if(!k.startsWith('_') || this.#isLocal()){
      if(this.#entrypoints[k]){
        entry_count++
        let result = this.#entrypoints[k](...args)
        entry_count--
        this.#flush()
        return result
      }
    }
  }

  set_orb(k,v){
    let def_model = this.#models[k]
    // todo: if existing orb, remove listeners, and move them to new orb
    console.log('setting ' + k + ' ' + v)
    if(v && v instanceof def_model){
      this.#orbs[k] = v
    } else if(v && typeof v == 'object'){
      this.#orbs[k] = new def_model({...v})
    } else {
      this.#orbs[k] = null
    }
  }

  get_orb(k){
    // need to check if bulk gets: let { one, two, three } = this.my_orb
    // correctly use prefix
    prefix = `${prefix}${k}.`
    return this.#orbs[k]
  }

  // TODO: allow for private state and such when it's accessed internally
  #isLocal(){
    return true
    // TODO: curr == this
  }

  #watch_get(key){
    let len = get_stack.length
    if(len != 0){
      get_stack[len - 1].add(prefix + key)
      prefix = ''
    }
  }

  #get_stack_push(){
    get_stack.push(new Set())
  }

  #get_stack_pop(){
    let accessed = get_stack.splice(get_stack.length-1,1)[0]
    return accessed
  }

  #derived_value(key){
    if(this.#valid[key]){
      return this.#cache[key]
    } else {
      this.#get_stack_push()
      let watchlist = this.#get_watchlists[key]
      let v = this.#getters[key]()
      let accessed = this.#get_stack_pop()
      let [toRemove,toAdd,toSub] = diff_acc(watchlist,accessed)
      toRemove.forEach(r_k => {
        this.#dep_graph[r_k].delete(key)
        this.#get_watchlists[key].delete(r_k)
      })
      toAdd.forEach(a_k => {
        this.#dep_graph[a_k].add(key)
        this.#get_watchlists[key].add(a_k)
      })
      toSub.forEach(([orb,acc_keys]) => {
        this.#orbs[orb].$(o => {

        })
      })
      this.#cache[key] = v
      this.#valid[key] = true
      return v
    }
  }

  #invalidate(key,is_state=false){
    if(is_state || this.#valid[key]){
      this.#changed.add(key)
      if(!is_state){
        // marks derived values as invalid (cached value is stale)
        this.#valid[key] = false
      }
      this.#dep_graph[key].forEach(k => this.#invalidate(k))
    }
  }

  #flush(){
    // if entry_stack is global, an entrypoint can orchestrate many context changes with only 1 effect loop
    if(entry_count == 0){
      this.#subs.forEach((watchlist,cb) => {
        if(watchlist == null || [...watchlist].some(k => this.#changed.has(k))){
          watchlist = new Set()
          this.#subs.set(cb,watchlist)
          this.#get_stack_push()
          cb(this.#this_orb)
          let accessed = this.#get_stack_pop()
          let [toRemove,toAdd,toSub] = diff_acc(watchlist,accessed)
          // TODO: in both instances, figure out a way to recursively subscribe to orb gets
          toRemove.forEach(r_k => {
            watchlist.delete(r_k)
          })
          toAdd.forEach(a_k => {
            watchlist.add(a_k)
          })
          toSub.forEach(([orb_key,props]) => {})
          if(watchlist.size == 0){
            this.#subs.delete(cb)
          }
          console.log('fx: accessed ' + [...watchlist].join(', '))
        }
      })
      this.#changed.clear()
    }
  }

}


function diff_acc(before,after){
  let toRemove = new Set([...before].filter(x => !after.has(x)))
  let toAdd = new Set([...after].filter(x => !before.has(x)))
  let orb_keys = {}
  Array.from([...after]).forEach((key) => {
    if(key.indexOf('.') > 0){
      let o_k = key.substring(0,key.indexOf('.'))
      let o_v = key.substring(key.indexOf('.')+1)
      if(orb_keys[o_k]){
        orb_keys[o_k].add(o_v)
      } else {
        orb_keys[o_k] = new Set([o_v])
      }
      toAdd.delete(key)
    }
  })
  let toSub = Object.keys(orb_keys).map(k => ([k,orb_keys[k]]))

  return [toRemove,toAdd,toSub]
}