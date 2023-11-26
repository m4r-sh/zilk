# orbz

Observable objects
- smart callbacks
- serializable
- performant logic execution
- recursive, local-first design

Allows for (but doesn't directly handle)
- Simple view reactivity
- Automatic sync/history/diffs
- Advanced editors for complex logic systems
- Connectable across clients

Similar to
- Signals (usignal)
- Observables


## TODOS

- Orb IDs & Model IDs
- Saving entire web of Orbs
- Pass Orbs from server to client with auto-saturation and synced data
- Bind each defined Model function to proper `this`. Distinguish between ()=>{} and function(){}

- Create visualizers for model defintions (dependency graph)


- Keep it as simple as possible for the core library. Ok to build on top, ok to add stuff to core later

## Behavior

`Model`:
- function that accepts a definition, and outputs a constructor for Orbs that follow Model's shape
- cache definition logic so that each Orb doesn't redo generic work
- all Orbs should be serialize-able (such that conversion to JSON & back should be seamless at any point in time. should handle links between internal orbs & external orbs somehow)
- `Ex_Model instanceof Model == true`
- `Ex_Orb instanceof Ex_Model == true`

`List(Model)`:
- list of a certain Model
- can create reactive filtered sub-lists
- can perform granular foreach that caches individual results
- can perform aggregate functions
- `List.$filter`
- `List.$foreach`
- `List.$map`
- `List.$reduce`
- `List.$add`
- `List.$remove`
- `List.$sort`

`Dict(Model)`:
- keyed dictionary of a certain model
- can create reactive filtered sub-dicts
- can perform granular foreach that caches individual results
- can perform aggregate functions
- `Dict.$filter`
- `Dict.$foreach`
- `Dict.$map`
- `Dict.$reduce`
- `Dict.$add`
- `Dict.$remove`
- `Dict.$sort`

These ^ should work with html.for and similar keyed outputs

API
```js
import { Model, Orb } from 'orbz'
let M = Model({ k: 'v' })
let O = M({ k: 'z' })
O.k // read -> works for values, suborbs, getters, _values, functions 
O.k = 'test' // write -> works for values, setters, suborbs (not _, fns, getters)
O.$(({ k }) => {}) // smart subscribe -> auto-proxy args to only callback on update
O.$.k // shorthand for single value subscription
O.toString() // useful for SSR
M.toString() // useful for Model ID SSR?
O[Orb.Save](data => idb.save(data), {...options}) // get JSON download of Orb state including model id
O[Orb.Load](data) // restore state based on external source
O instanceof M == true
for(let k in O){} // each public value (use .Load for full state)
O({ ... }) // set multiple values at the same time (if obj). cannot set _internal states . internal proxies use this API to bulk set
```

Definitions
- `{ [Model.Save/Load] }` special symbols to customize serialization
- `{ [Model.instanceOf] }` override default instanceof to allow for similar existing models
- `{ $: }` cannot set '$' key as this is the subscription handler

- `{ $fn(){} }` like a getter, but accepts parameters, and returns an orb that can be subscribed to. good for `list_orb.$filter()`

- `{ _internal_key }` underscore prefixed keys only settable by og functions or [Model.load]
- `getters` keep record of their dependencies via `this` proxy. should re-calculate actively only if subbed. should always cache on calculate even if no subs. not allowed to set.
    - if a promise is returned, zilk should inte rnally wait for resolve before updating the "cached" / "available" value.
- `entrypoints` should pause local propogation until complete. allows for multiple "sets" in succession with only 1 re-calculation pass. can return a value, but doesn't get watched directly. watches that occur during the entrypoint are assigned to the caller of the entrypoint (can be nothing, or an effect, or inside a getter)

- `{ [Model.Extend(OtherModel)]: function(){} }` mirror view of current context in format of existing other. Good for generic `List`s.
- `{ key: Ex_Orb.$.key }` link a value from Ex_Orb directly (thru a proxy)
- `{ key: Ex_Orb.$(({ k1, k2 }) => k1 + k2)}` link a derived value from Ex_Orb
- `{ key: Ex_Orb }` link a context. lazily attaches to subscriptions - and does so through a proxy to allow for context swapping and correctly assigned subscriptions


- `*functions()` should replace setTimeout(), setInterval(), and persistent async tasks that mutate state over time (and can be resumed / terminated / undone later)




## Alignment

- COPY PASTE as a first-class citizen. Behavioral code should be visible, easily readable, and quickly edited. Public library of copy-pasteable models > a list of npm imports
- Model writers should consider performance, there are plenty of design choices. But model source code should have as little boilerplate as possible. Perfectable by pros, readable by anyone
- Orb users should be able to read/write values just like a normal JS object. should feel like magic to get automatic updates with interconnected orbs.
- Orb instances should function like files. easy to download, backup, upload. import/export/name/group
- Should be ~trivial to write the definition for a model, and automatically get a web editor with saving and sync built-in
- Live JSON. JSON storage + Javascript Rendering + Observation graph
- Should be possible to see history of mutations - no need to store computed values.
- Should be able to perform searches for orbs that match a particular model type
- ^ This would allow models as default parameters - that are swapped out at runtime by matching orbs



# Notes
```js
// constraints can be helpful for abstracting 
const Adult = Person.Guard(({ age }) => age >= 18)
const Legal = Person.Guard(({ age }) => age >= 21)
```