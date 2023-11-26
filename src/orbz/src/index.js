import { OrbCore, $Z } from "./OrbCore.js";

// TODO: Model.self() for self-type orbs within another orb (friend has a friend, etc, linked list)
// TODO: Model.save which serializes all state
// TODO: Model.load which reboots from stored JSON
// TODO: Model.extend(Other) with auto-extending when multiple args are passed into definition. prototype chain
// TODO: [OtherModel.cast]: pass instanceof checks by creating a proxy of current context
// TODO: [Model.instanceOf]: special check for instanceof. for lists, can help with grouping similar contexts
let MODEL_SELF = Symbol('m-self')
let SYMBOL_ISMODEL = Symbol('orbz-ismodel')
let Z_DEFS = Symbol('model-def')

let shared_proto = {
  $: { value: function(cb,watchlist){
    if(typeof cb == 'function'){
      return this[$Z].add_sub(cb,watchlist)
    } else if(typeof cb == 'string'){
      return this[$Z].add_link(cb,watchlist)
    }
  }},
  toString: { value: function(){ 
    return 'orb toString'
  }},
  [Symbol.toPrimitive]: { value: function(){
    return 'orb toPrimitive'
  }},
  [Symbol.toStringTag]: { value: function(){ 
    return 'orb string tag'
  }}
}



function Model(){
  let { defs, types } = scan(arguments[arguments.length-1])
  for(let i = arguments.length - 2; i >= 0; i--){
    defs = deepMerge(arguments[i][Z_DEFS], defs)
  }

  function ModelConstructor(state={}){
    if(!new.target){ return new ModelConstructor(state) }
    Object.defineProperty(this,$Z,{ value: new OrbCore(defs,state,this) })
    Object.preventExtensions(this)
  }

  ModelConstructor[Z_DEFS] = defs

  // create a prototype chain for every inherited model
  if(arguments.length >= 2){
    Object.setPrototypeOf(ModelConstructor.prototype,arguments[0])
  }

  // assign self to values with placeholder
  Object.keys(defs.orbs).forEach(k => {
    if(defs.orbs[k] == MODEL_SELF){
      defs.orbs[k] = ModelConstructor
    }
  })

  Object.defineProperty(ModelConstructor,SYMBOL_ISMODEL,{ value: true })

  Object.keys(defs.entry).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      value: function(){
        return this[$Z].run_entrypoint(k,arguments)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.derived).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_derived(k)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.getset).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_derived(k)
      },
      set(v){
        return this[$Z].run_entrypoint(k,[v])
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.state).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_state(k)
      },
      set(v){
        this[$Z].set_state(k,v)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.orbs).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_orb(k)
      },
      set(v){
        this[$Z].set_orb(k,v)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.defineProperties(ModelConstructor.prototype, shared_proto);

  return ModelConstructor
}

Model.self = () => MODEL_SELF

Object.defineProperty(Model,Symbol.hasInstance,{
  value(o){
    return (o && o[SYMBOL_ISMODEL])
  }
})

function Orb(def){
  return Model(def)()
}

Object.defineProperty(Orb,Symbol.hasInstance,{
  value(o){
    return (o && o[$Z] && o[$Z] instanceof OrbCore)
  }
})

export { Model, Orb }

function scan(model){
  // let internal = {}, overrides = {}, models = {}, orbs = {}
  let defs = {
    state: {},
    derived: {},
    entry: {},
    orbs: {},
    getset: {}
  }
  let types = {}
  let prop_descs = Object.getOwnPropertyDescriptors(model)
  Object.keys(prop_descs).forEach(key => {
    let type, def
    let { value, get, set } = prop_descs[key]
    if(get && set){
      type = 'getset'
      def = { get, set }
    } else if(get){
      def = get
      type = 'derived'
    } else if(set){
      console.log('TODO: lone setter')
    } else {
      def = value
      if(typeof value == 'function'){
        if(value instanceof Model){
          type = 'orbs'
        } else {
          type = 'entry'
        }
      } else {
        if (value == MODEL_SELF){
          type = 'orbs'
        } else {
          type = 'state'
        }
      }
    }
    types[key] = type
    defs[type][key] = def
  });

  return { types, defs }
}

function deepMerge(target, source) {
  const result = { ...target, ...source };
  for (const key of Object.keys(result)) {
    result[key] =
      typeof target[key] == 'object' && typeof source[key] == 'object'
        ? deepMerge(target[key], source[key])
        : result[key] //structuredClone(result[key]);
  }
  return result;
}