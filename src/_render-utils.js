import { fmt, jsonstr } from '@m4rsh/cones'

export function classify(n){
  n = n.replace(/(^[^A-Za-z_]+)|[^A-Za-z0-9_-]+/g, (m, m1) => m1 ? '' : '-')
  return new Proxy({},{
    get(_,prop){
      if(prop===Symbol.toPrimitive || prop === 'toString'){ return ()=>n }
      if(prop===Symbol.toStringTag) return 'classified'
      return classify(n+'__'+prop.toString())
    }
  })
}

export function plain(t){
  if(typeof t === 'string'){
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length; i < l; i++)
    s += arguments[i] + t[i];
  return s;
}

export { fmt, jsonstr }
