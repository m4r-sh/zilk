function classify(n){
  return new Proxy({},{
    get(_,prop){
      if(prop===Symbol.toPrimitive || prop === 'toString'){ return ()=>n }
      if(prop===Symbol.toStringTag) return 'classified'
      return classify(n+'__'+prop.toString())
    }
  })
}

const plain = function(t){
  if(typeof t === 'string'){
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length; i < l; i++)
    s += arguments[i] + t[i];
  return s;
}

const raw = new Proxy(plain,{
  get(_,k){
    let f = plain.bind(null)
    f.lang = k
    return f
  }
})
const css = raw.css

export {
  css, raw, classify
}