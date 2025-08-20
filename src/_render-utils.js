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

export function dedent(strings, ...values){
  const raw = typeof strings === "string" ? [strings] : strings.raw;
  const escapeSpecialCharacters = Array.isArray(strings)

  // first, perform interpolation
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    let next = escapeSpecialCharacters
      ? raw[i].replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\{/g, "{")
      : raw[i]
    result += next;
    if (i < values.length) {
      let value = values[i];
      if (typeof value === "string" && value.includes("\n")) {
        // indent the value to match the indentation of the current line
        const m = result.slice(result.lastIndexOf("\n") + 1).match(/^(\s+)/);
        if (m) {
          const indent = m[1];
          value = value.replace(/\n/g, `\n${indent}`);
        }
      }
      result += value;
    }
  }

  // now strip indentation
  const lines = result.split("\n");
  let mindent = Math.min(...lines.map(l => l.match(/^(\s+)\S+/)).filter(m=>m).map(m => m[1].length))
  result = lines.map(l => (l[0] == ' ' || l[0] == '\t') ? l.slice(mindent) : l).join('\n').trim()

  // handle escaped newlines at the end to ensure they don't get stripped too
  return escapeSpecialCharacters
    ? result.replace(/\\n/g, "\n")
    : result
}

