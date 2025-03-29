// @bun
// node_modules/@webreflection/mapset/esm/index.js
class WeakMapSet extends WeakMap {
  set(key, value) {
    super.set(key, value);
    return value;
  }
}

// node_modules/uhtml-ssr/node_modules/@webreflection/uparser/esm/index.js
/*! (c) Andrea Giammarchi - ISC */
var empty = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
var elements = /<([a-z]+[a-z0-9:._-]*)([^>]*?)(\/?)>/g;
var attributes = /([^\s\\>"'=]+)\s*=\s*(['"]?)\x01/g;
var holes = /[\x01\x02]/g;
var esm_default = (template, prefix, svg) => {
  let i = 0;
  return template.join("\x01").trim().replace(elements, (_, name, attrs, selfClosing) => {
    let ml = name + attrs.replace(attributes, "\x02=$2$1").trimEnd();
    if (selfClosing.length)
      ml += svg || empty.test(name) ? " /" : "></" + name;
    return "<" + ml + ">";
  }).replace(holes, (hole) => hole === "\x01" ? "<!--" + prefix + i++ + "-->" : prefix + i++);
};

// node_modules/html-escaper/esm/index.js
var { replace } = "";
var ca = /[&<>'"]/g;
var esca = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
};
var pe = (m) => esca[m];
var escape = (es) => replace.call(es, ca, pe);

// node_modules/uhyphen/esm/index.js
var esm_default2 = (camel) => camel.replace(/(([A-Z0-9])([A-Z0-9][a-z]))|(([a-z])([A-Z]))/g, "$2$5-$3$6").toLowerCase();

// node_modules/uhandlers/esm/index.js
var ref = (node) => {
  let oldValue;
  return (value) => {
    if (oldValue !== value) {
      oldValue = value;
      if (typeof value === "function")
        value(node);
      else
        value.current = node;
    }
  };
};

// node_modules/uhtml-ssr/esm/utils.js
var { isArray: isArray2 } = Array;
var { toString } = Function;
var { keys } = Object;
var passRef = ref(null);
var prefix = "is\xB5" + Date.now();
var rename = /([^\s>]+)[\s\S]*$/;
var interpolation = new RegExp(`(<!--${prefix}(\\d+)-->|\\s*${prefix}(\\d+)=([^\\s>]))`, "g");
var attribute = (name, quote, value) => ` ${name}=${quote}${escape(value)}${quote}`;
var getValue = (value) => {
  switch (typeof value) {
    case "string":
      return escape(value);
    case "boolean":
    case "number":
      return String(value);
    case "object":
      switch (true) {
        case isArray2(value):
          return value.map(getValue).join("");
        case value instanceof Hole:
          return value.toString();
      }
      break;
    case "function":
      return getValue(value());
  }
  return value == null ? "" : escape(String(value));
};
var useForeign = false;

class Foreign {
  constructor(handler, value) {
    this._ = (...args) => handler(...args, value);
  }
}
class Hole extends String {
}
var parse = (template, expectedLength, svg) => {
  const html = esm_default(template, prefix, svg);
  const updates = [];
  let i = 0;
  let match = null;
  while (match = interpolation.exec(html)) {
    const pre = html.slice(i, match.index);
    i = match.index + match[0].length;
    if (match[2])
      updates.push((value) => pre + getValue(value));
    else {
      let name = "";
      let quote = match[4];
      switch (quote) {
        case '"':
        case "'":
          const next = html.indexOf(quote, i);
          name = html.slice(i, next);
          i = next + 1;
          break;
        default:
          name = html.slice(--i).replace(rename, "$1");
          i += name.length;
          quote = '"';
          break;
      }
      switch (true) {
        case name === "aria":
          updates.push((value) => pre + keys(value).map(aria, value).join(""));
          break;
        case name === "ref":
          updates.push((value) => {
            passRef(value);
            return pre;
          });
          break;
        case name[0] === "?":
          const boolean = name.slice(1).toLowerCase();
          updates.push((value) => {
            let result = pre;
            if (value)
              result += ` ${boolean}`;
            return result;
          });
          break;
        case name[0] === ".":
          const lower = name.slice(1).toLowerCase();
          updates.push(lower === "dataset" ? (value) => pre + keys(value).filter((key) => value[key] != null).map(data, value).join("") : (value) => {
            let result = pre;
            if (value != null && value !== false) {
              if (value === true)
                result += ` ${lower}`;
              else
                result += attribute(lower, quote, value);
            }
            return result;
          });
          break;
        case name[0] === "@":
          name = "on" + name.slice(1);
        case (name[0] === "o" && name[1] === "n"):
          updates.push((value) => {
            let result = pre;
            switch (typeof value) {
              case "object":
                if (!(name in value))
                  break;
                value = value[name];
                if (typeof value !== "function")
                  break;
              case "function":
                if (value.toString === toString)
                  break;
              case "string":
                result += attribute(name, quote, value);
                break;
            }
            return result;
          });
          break;
        default:
          updates.push((value) => {
            let result = pre;
            if (value != null) {
              if (useForeign && value instanceof Foreign) {
                value = value._(null, name);
                if (value == null)
                  return result;
              }
              result += attribute(name, quote, value);
            }
            return result;
          });
          break;
      }
    }
  }
  const { length } = updates;
  if (length !== expectedLength)
    throw new Error(`invalid template ${template}`);
  if (length) {
    const last = updates[length - 1];
    const chunk = html.slice(i);
    updates[length - 1] = (value) => last(value) + chunk;
  } else
    updates.push(() => html);
  return updates;
};
function aria(key) {
  const value = escape(this[key]);
  return key === "role" ? ` role="${value}"` : ` aria-${key.toLowerCase()}="${value}"`;
}
function data(key) {
  return ` data-${esm_default2(key)}="${escape(this[key])}"`;
}

// node_modules/uhtml-ssr/esm/index.js
var cache = new WeakMapSet;
var uhtmlParity = (svg) => {
  const fn = (template, ...values) => {
    const { length } = values;
    const updates = cache.get(template) || cache.set(template, parse(template, length, svg));
    return new Hole(length ? values.map(update, updates).join("") : updates[0]());
  };
  fn.node = fn;
  fn.for = () => fn;
  return fn;
};
var html = uhtmlParity(false);
var svg = uhtmlParity(true);
var render = (where, what) => {
  const content = (typeof what === "function" ? what() : what).toString();
  return typeof where === "function" ? where(content) : (where.write(content), where);
};
function update(value, i) {
  return this[i](value);
}

// src/render/shared.js
function classify(n) {
  return new Proxy({}, {
    get(_, prop) {
      if (prop === Symbol.toPrimitive || prop === "toString") {
        return () => n;
      }
      if (prop === Symbol.toStringTag)
        return "classified";
      return classify(n + "__" + prop.toString());
    }
  });
}

// src/render/server.js
var plain = function(t) {
  if (typeof t === "string") {
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length;i < l; i++)
    s += arguments[i] + t[i];
  return new Hole(s);
};
var raw = new Proxy(plain, {
  get(_, k) {
    let f = plain.bind(null);
    f.lang = k;
    return f;
  }
});
var css = raw.css;
var htmlFor = html;
var svgFor = svg;
// ../orbz/dist/bun/index.js
var diff_acc = function(before, after) {
  let toRemove = new Set([...before].filter((x) => !after.has(x)));
  let toAdd = new Set([...after].filter((x) => !before.has(x)));
  let orb_keys = {};
  Array.from([...after]).forEach((key) => {
    if (key.indexOf(".") > 0) {
      let o_k = key.substring(0, key.indexOf("."));
      let o_v = key.substring(key.indexOf(".") + 1);
      if (orb_keys[o_k]) {
        orb_keys[o_k].add(o_v);
      } else {
        orb_keys[o_k] = new Set([o_v]);
      }
      toAdd.delete(key);
    }
  });
  let toSub = Object.keys(orb_keys).map((k) => [k, orb_keys[k]]);
  return [toRemove, toAdd, toSub];
};
var entry_count = 0;
var get_stack = [];
var curr_get = null;
var prefix2 = "";
var $Z = Symbol("orbz-core");

class OrbCore {
  #models = {};
  #state = {};
  #orbs = {};
  #changed = new Set;
  #cache = {};
  #valid = {};
  #getters = {};
  #entrypoints = {};
  #this_orb;
  #subs = new Map;
  #dep_graph = {};
  #get_watchlists = {};
  #link_graph = {};
  #init_done = false;
  #isLocal() {
    return curr_get == this || !this.#init_done;
  }
  #watch_get(key) {
    let len = get_stack.length;
    if (len != 0) {
      get_stack[len - 1].add(prefix2 + key);
      prefix2 = "";
    }
  }
  #get_stack_push() {
    get_stack.push(new Set);
  }
  #get_stack_pop() {
    let accessed = get_stack.splice(get_stack.length - 1, 1)[0];
    return accessed;
  }
  #derived_value(key) {
    if (this.#valid[key]) {
      return this.#cache[key];
    } else {
      this.#get_stack_push();
      let watchlist = this.#get_watchlists[key];
      let v = this.#getters[key]();
      let accessed = this.#get_stack_pop();
      let [toRemove, toAdd, toSub] = diff_acc(watchlist, accessed);
      toRemove.forEach((r_k) => {
        this.#dep_graph[r_k].delete(key);
        this.#get_watchlists[key].delete(r_k);
      });
      toAdd.forEach((a_k) => {
        if (this.#dep_graph[a_k]) {
          this.#dep_graph[a_k].add(key);
        }
        this.#get_watchlists[key].add(a_k);
      });
      toSub.forEach(([orb, acc_keys]) => {
        this.#orbs[orb].$((o) => {});
      });
      this.#cache[key] = v;
      this.#valid[key] = true;
      return v;
    }
  }
  #invalidate(key, is_state = false) {
    if (this.#init_done) {
      if (is_state || this.#valid[key]) {
        this.#changed.add(key);
        if (!is_state) {
          this.#valid[key] = false;
        }
        this.#dep_graph[key].forEach((k) => this.#invalidate(k));
      }
    }
  }
  #flush() {
    if (entry_count == 0 && this.#changed.size > 0) {
      this.#subs.forEach((watchlist, cb) => {
        if (watchlist == null || [...watchlist].some((k) => this.#changed.has(k))) {
          watchlist = new Set;
          this.#get_stack_push();
          cb(this.#this_orb);
          let accessed = this.#get_stack_pop();
          let [toRemove, toAdd, toSub] = diff_acc(watchlist, accessed);
          toRemove.forEach((r_k) => {
            watchlist.delete(r_k);
          });
          toAdd.forEach((a_k) => {
            watchlist.add(a_k);
          });
          toSub.forEach(([orb_key, props]) => {});
          if (watchlist.size == 0) {
            this.#subs.delete(cb);
          } else {
            this.#subs.set(cb, watchlist);
          }
        }
      });
      this.#changed.clear();
    }
  }
  constructor(defs, state, this_orb) {
    this.#this_orb = this_orb;
    this.#models = defs.orbs;
    for (const key in defs.state) {
      this.#dep_graph[key] = new Set;
      this.set_state(key, key in state ? state[key] : structuredClone(defs.state[key]));
    }
    for (const key in defs.orbs) {
      this.#dep_graph[key] = new Set;
      this.set_orb(key, state[key]);
    }
    for (const key in defs.entry) {
      this.#entrypoints[key] = defs.entry[key].bind(this.#this_orb);
    }
    for (const key in defs.async) {
      this.#entrypoints[key] = defs.async[key].bind(this.#this_orb);
    }
    for (const key in defs.derived) {
      this.#dep_graph[key] = new Set;
      this.#get_watchlists[key] = new Set;
      this.#getters[key] = defs.derived[key].bind(this.#this_orb);
    }
    for (const key in defs.getset) {
      this.#dep_graph[key] = new Set;
      this.#get_watchlists[key] = new Set;
      this.#getters[key] = defs.getset[key].get.bind(this.#this_orb);
      this.#entrypoints[key] = defs.getset[key].set.bind(this.#this_orb);
    }
    this.#init_done = true;
  }
  add_link(k, options) {
    let link_set = this.#link_graph[k];
    return (external_cb) => {
      link_set.add(external_cb);
      return () => {
        link_set.delete(external_cb);
      };
    };
  }
  add_sub(cb, watchlist) {
    this.#subs.set(cb, null);
    return () => {
      this.#subs.delete(cb);
    };
  }
  get_state(k) {
    if (!k.startsWith("_") || this.#isLocal()) {
      this.#watch_get(k);
      return this.#state[k];
    }
  }
  set_state(k, v) {
    if (!k.startsWith("_") || this.#isLocal()) {
      if (v != this.#state[k]) {
        this.#state[k] = v;
        this.#invalidate(k, true);
        this.#flush();
      }
    }
  }
  get_derived(k) {
    if (!k.startsWith("_") || this.#isLocal()) {
      this.#watch_get(k);
      let res;
      const prev = curr_get;
      curr_get = this;
      try {
        res = this.#derived_value(k);
      } finally {
        curr_get = prev;
      }
      return res;
    }
  }
  run_entrypoint(k, args, { async = false } = {}) {
    if (!k.startsWith("_") || this.#isLocal()) {
      if (this.#entrypoints[k]) {
        let res;
        const prev = curr_get;
        if (!async) {
          curr_get = this;
          entry_count++;
        }
        try {
          res = this.#entrypoints[k](...args);
        } finally {
          curr_get = prev;
        }
        if (async) {
          return res.then((ans) => {
            this.#flush();
            return ans;
          });
        } else {
          entry_count--;
          this.#flush();
          return res;
        }
      }
    }
  }
  set_orb(k, v) {
    let def_model = this.#models[k];
    if (v && v instanceof def_model) {
      this.#orbs[k] = v;
    } else if (v && typeof v == "object") {
      this.#orbs[k] = new def_model({ ...v });
    } else {
      this.#orbs[k] = null;
    }
  }
  get_orb(k) {
    this.#watch_get(k);
    return this.#orbs[k];
  }
}
var $Z2 = Symbol.for("orbz-orb-core");
var $L = Symbol.for("orbz-list-core");
var MODEL_SELF = Symbol.for("orbz-m-self");
var SYMBOL_ISMODEL = Symbol.for("orbz-orbz-ismodel");
var Z_DEFS = Symbol.for("orbz-model-def");
var Z_MODEL_IDS = Symbol.for("orbz-model-id");
var MODEL_IMPLEMENTS = Symbol.for("orbz-model-implements");
var Model = function() {
  let { defs, types } = scan(arguments[arguments.length - 1]);
  let model_id = Symbol("unique-model-id");
  let ids = [model_id];
  for (let i = arguments.length - 2;i >= 0; i--) {
    defs = deepMerge(arguments[i][Z_DEFS], defs);
    ids.push(...arguments[i][Z_MODEL_IDS]);
  }
  function ModelConstructor(state = {}) {
    if (!new.target) {
      return new ModelConstructor(state);
    }
    Object.defineProperty(this, $Z2, { value: new OrbCore(defs, state, this) });
    Object.defineProperty(this, MODEL_IMPLEMENTS, { value: ids });
    Object.preventExtensions(this);
  }
  Object.defineProperty(ModelConstructor, Symbol.hasInstance, {
    value: function(o) {
      return o && o[MODEL_IMPLEMENTS] && o[MODEL_IMPLEMENTS].includes(model_id);
    }
  });
  ModelConstructor[Z_DEFS] = defs;
  ModelConstructor[Z_MODEL_IDS] = ids;
  ModelConstructor.toString = function() {
    return stringifyModel(defs);
  };
  Object.keys(defs.orbs).forEach((k) => {
    if (defs.orbs[k] == MODEL_SELF) {
      defs.orbs[k] = ModelConstructor;
    }
  });
  Object.keys(defs.entry).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      value: function() {
        return this[$Z2].run_entrypoint(k, arguments, { async: false });
      }
    });
  });
  Object.keys(defs.async).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      value: function() {
        return this[$Z2].run_entrypoint(k, arguments, { async: true });
      }
    });
  });
  Object.keys(defs.derived).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      get() {
        return this[$Z2].get_derived(k);
      },
      enumerable: !k.startsWith("_")
    });
  });
  Object.keys(defs.getset).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      get() {
        return this[$Z2].get_derived(k);
      },
      set(v) {
        return this[$Z2].run_entrypoint(k, [v]);
      },
      enumerable: !k.startsWith("_")
    });
  });
  Object.keys(defs.state).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      get() {
        return this[$Z2].get_state(k);
      },
      set(v) {
        this[$Z2].set_state(k, v);
      },
      enumerable: !k.startsWith("_")
    });
  });
  Object.keys(defs.orbs).forEach((k) => {
    Object.defineProperty(ModelConstructor.prototype, k, {
      get() {
        return this[$Z2].get_orb(k);
      },
      set(v) {
        this[$Z2].set_orb(k, v);
      },
      enumerable: !k.startsWith("_")
    });
  });
  Object.defineProperties(ModelConstructor.prototype, shared_proto);
  return ModelConstructor;
};
var scan = function(model) {
  let defs = {
    state: {},
    derived: {},
    entry: {},
    orbs: {},
    getset: {},
    async: {}
  };
  let types = {};
  let prop_descs = Object.getOwnPropertyDescriptors(model);
  Object.keys(prop_descs).forEach((key) => {
    let type, def;
    let { value, get, set } = prop_descs[key];
    if (get && set) {
      type = "getset";
      def = { get, set };
    } else if (get) {
      def = get;
      type = "derived";
    } else if (set) {
      console.log("TODO: lone setter");
    } else {
      def = value;
      if (typeof value == "function") {
        if (value instanceof Model) {
          type = "orbs";
        } else if (value.constructor.name == "AsyncFunction") {
          type = "async";
        } else {
          type = "entry";
        }
      } else {
        if (value == MODEL_SELF) {
          type = "orbs";
        } else {
          type = "state";
        }
      }
    }
    types[key] = type;
    defs[type][key] = def;
  });
  return { types, defs };
};
var deepMerge = function(target, source) {
  const result = { ...target, ...source };
  for (const key of Object.keys(result)) {
    result[key] = typeof target[key] == "object" && typeof source[key] == "object" ? deepMerge(target[key], source[key]) : result[key];
  }
  return result;
};
function stringifyModel({ state, derived, entry, orbs, getset, async }) {
  let str = `{
`;
  str += Object.keys(state).map((k) => `${k}:${parseValue(state[k], k)}`).join(`,
`);
  str += `,
`;
  str += Object.keys(derived).map((k) => `${derived[k]}`).join(`,
`);
  str += `,
`;
  str += Object.keys(entry).map((k) => `${entry[k]}`).join(`,
`);
  str += `,
`;
  str += "}";
  return str;
}
var shared_proto = {
  $: { value: function(cb, watchlist) {
    if (typeof cb == "function") {
      return this[$Z2].add_sub(cb, watchlist);
    } else if (typeof cb == "string") {
      return this[$Z2].add_link(cb, watchlist);
    }
  } },
  $invalidate: { value: function(str) {
    this[$Z2].inval(str);
  } }
};
Model.self = () => MODEL_SELF;
Model.stringify = function(ModelConstructor) {
  return stringifyModel(ModelConstructor[Z_DEFS]);
};
Object.defineProperty(Model, Symbol.hasInstance, {
  value(o) {
    return o && Object.hasOwn(o, Z_MODEL_IDS);
  }
});
Object.defineProperty(Model, "toString", {
  value(o) {
    return o && Object.hasOwn(o, Z_MODEL_IDS);
  }
});
/*! (c) Andrea Giammarchi - ISC */
var stringifyObject = (handler) => "{" + Object.keys(handler).map((key) => {
  const { get, set, value } = Object.getOwnPropertyDescriptor(handler, key);
  if (get && set)
    key = get + "," + set;
  else if (get)
    key = "" + get;
  else if (set)
    key = "" + set;
  else
    key = JSON.stringify(key) + ":" + parseValue(value, key);
  return key;
}).join(",") + "}";
var parseValue = (value, key) => {
  const type = typeof value;
  if (type === "function")
    return value.toString().replace(new RegExp("^(\\*|async )?\\s*" + key + "[^(]*?\\("), (_, $1) => $1 === "*" ? "function* (" : ($1 || "") + "function (");
  if (type === "object" && value)
    return Array.isArray(value) ? parseArray(value) : stringifyObject(value);
  return JSON.stringify(value);
};
var parseArray = (array) => "[" + array.map(parseValue).join(",") + "]";
var Orb = function(def) {
  return Model(def)();
};
Object.defineProperty(Orb, Symbol.hasInstance, {
  value(o) {
    return o && o[$Z2] && o[$Z2] instanceof OrbCore;
  }
});
export {
  svgFor,
  svg,
  render,
  raw,
  htmlFor,
  html,
  css,
  classify,
  Orb,
  Model,
  Hole
};
