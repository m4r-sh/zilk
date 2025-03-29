function classify(n){
  return new Proxy({},{
    get(_,prop){
      if(prop===Symbol.toPrimitive || prop === 'toString'){ return ()=>n }
      if(prop===Symbol.toStringTag) return 'classified'
      return classify(n+'__'+prop.toString())
    }
  })
}



export {
  classify
}