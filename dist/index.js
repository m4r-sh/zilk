// node_modules/udomdiff/esm/index.js
var esm_default = (parentNode, a, b, get, before) => {
  const bLength = b.length;
  let aEnd = a.length;
  let bEnd = bLength;
  let aStart = 0;
  let bStart = 0;
  let map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0) : before;
      while (bStart < bEnd)
        parentNode.insertBefore(get(b[bStart++], 1), node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]))
          parentNode.removeChild(get(a[aStart], -1));
        aStart++;
      }
    } else if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
    } else if (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = get(a[--aEnd], -1).nextSibling;
      parentNode.insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
      parentNode.insertBefore(get(b[--bEnd], 1), node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map;
        let i = bStart;
        while (i < bEnd)
          map.set(b[i], i++);
      }
      if (map.has(a[aStart])) {
        const index = map.get(a[aStart]);
        if (bStart < index && index < bEnd) {
          let i = aStart;
          let sequence = 1;
          while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence)
            sequence++;
          if (sequence > index - bStart) {
            const node = get(a[aStart], 0);
            while (bStart < index)
              parentNode.insertBefore(get(b[bStart++], 1), node);
          } else {
            parentNode.replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
          }
        } else
          aStart++;
      } else
        parentNode.removeChild(get(a[aStart++], -1));
    }
  }
  return b;
};

// node_modules/uhtml/esm/utils.js
var { isArray } = Array;
var { getPrototypeOf, getOwnPropertyDescriptor } = Object;
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var empty = [];
var newRange = () => document.createRange();
var set = (map, key, value) => {
  map.set(key, value);
  return value;
};
var gPD = (ref, prop) => {
  let desc;
  do {
    desc = getOwnPropertyDescriptor(ref, prop);
  } while (!desc && (ref = getPrototypeOf(ref)));
  return desc;
};

// node_modules/domconstants/esm/constants.js
var ELEMENT_NODE = 1;
var COMMENT_NODE = 8;
var DOCUMENT_FRAGMENT_NODE = 11;

// node_modules/custom-function/esm/factory.js
/*! (c) Andrea Giammarchi - ISC */
var { setPrototypeOf } = Object;
var factory_default = (Class) => {
  function Custom(target) {
    return setPrototypeOf(target, new.target.prototype);
  }
  Custom.prototype = Class.prototype;
  return Custom;
};

// node_modules/uhtml/esm/range.js
var range;
var range_default = (firstChild, lastChild, preserve) => {
  if (!range)
    range = newRange();
  if (preserve)
    range.setStartAfter(firstChild);
  else
    range.setStartBefore(firstChild);
  range.setEndAfter(lastChild);
  range.deleteContents();
  return firstChild;
};

// node_modules/uhtml/esm/persistent-fragment.js
var remove = ({ firstChild, lastChild }, preserve) => range_default(firstChild, lastChild, preserve);
var checkType = false;
var diffFragment = (node, operation) => checkType && node.nodeType === DOCUMENT_FRAGMENT_NODE ? 1 / operation < 0 ? operation ? remove(node, true) : node.lastChild : operation ? node.valueOf() : node.firstChild : node;
var comment = (value) => document.createComment(value);

class PersistentFragment extends factory_default(DocumentFragment) {
  #firstChild = comment("<>");
  #lastChild = comment("</>");
  #nodes = empty;
  constructor(fragment) {
    super(fragment);
    this.replaceChildren(...[
      this.#firstChild,
      ...fragment.childNodes,
      this.#lastChild
    ]);
    checkType = true;
  }
  get firstChild() {
    return this.#firstChild;
  }
  get lastChild() {
    return this.#lastChild;
  }
  get parentNode() {
    return this.#firstChild.parentNode;
  }
  remove() {
    remove(this, false);
  }
  replaceWith(node) {
    remove(this, true).replaceWith(node);
  }
  valueOf() {
    let { firstChild, lastChild, parentNode } = this;
    if (parentNode === this) {
      if (this.#nodes === empty)
        this.#nodes = [...this.childNodes];
    } else {
      if (parentNode) {
        this.#nodes = [firstChild];
        while (firstChild !== lastChild)
          this.#nodes.push(firstChild = firstChild.nextSibling);
      }
      this.replaceChildren(...this.#nodes);
    }
    return this;
  }
}

// node_modules/uhtml/esm/handler.js
var setAttribute = (element, name, value) => element.setAttribute(name, value);
var removeAttribute = (element, name) => element.removeAttribute(name);
var aria = (element, value) => {
  for (const key in value) {
    const $ = value[key];
    const name = key === "role" ? key : `aria-${key}`;
    if ($ == null)
      removeAttribute(element, name);
    else
      setAttribute(element, name, $);
  }
  return value;
};
var listeners;
var at = (element, value, name) => {
  name = name.slice(1);
  if (!listeners)
    listeners = new WeakMap;
  const known = listeners.get(element) || set(listeners, element, {});
  let current = known[name];
  if (current && current[0])
    element.removeEventListener(name, ...current);
  current = isArray(value) ? value : [value, false];
  known[name] = current;
  if (current[0])
    element.addEventListener(name, ...current);
  return value;
};
var holes = new WeakMap;
var hole = (detail, value) => {
  const { t: node, n: hole2 } = detail;
  let nullish = false;
  switch (typeof value) {
    case "object":
      if (value !== null) {
        (hole2 || node).replaceWith(detail.n = value.valueOf());
        break;
      }
    case "undefined":
      nullish = true;
    default:
      node.data = nullish ? "" : value;
      if (hole2) {
        detail.n = null;
        hole2.replaceWith(node);
      }
      break;
  }
  return value;
};
var className = (element, value) => maybeDirect(element, value, value == null ? "class" : "className");
var data = (element, value) => {
  const { dataset } = element;
  for (const key in value) {
    if (value[key] == null)
      delete dataset[key];
    else
      dataset[key] = value[key];
  }
  return value;
};
var direct = (ref, value, name) => ref[name] = value;
var dot = (element, value, name) => direct(element, value, name.slice(1));
var maybeDirect = (element, value, name) => value == null ? (removeAttribute(element, name), value) : direct(element, value, name);
var ref = (element, value) => (typeof value === "function" ? value(element) : value.current = element, value);
var regular = (element, value, name) => (value == null ? removeAttribute(element, name) : setAttribute(element, name, value), value);
var style = (element, value) => value == null ? maybeDirect(element, value, "style") : direct(element.style, value, "cssText");
var toggle = (element, value, name) => (element.toggleAttribute(name.slice(1), value), value);
var array = (node, value, prev) => {
  const { length } = value;
  node.data = `[${length}]`;
  if (length)
    return esm_default(node.parentNode, prev, value, diffFragment, node);
  switch (prev.length) {
    case 1:
      prev[0].remove();
    case 0:
      break;
    default:
      range_default(diffFragment(prev[0], 0), diffFragment(prev.at(-1), -0), false);
      break;
  }
  return empty;
};
var attr = new Map([
  ["aria", aria],
  ["class", className],
  ["data", data],
  ["ref", ref],
  ["style", style]
]);
var attribute = (element, name, svg) => {
  switch (name[0]) {
    case ".":
      return dot;
    case "?":
      return toggle;
    case "@":
      return at;
    default:
      return svg || "ownerSVGElement" in element ? name === "ref" ? ref : regular : attr.get(name) || (name in element ? name.startsWith("on") ? direct : gPD(element, name)?.set ? maybeDirect : regular : regular);
  }
};
var text = (element, value) => (element.textContent = value == null ? "" : value, value);

// node_modules/uhtml/esm/literals.js
var abc = (a, b, c) => ({ a, b, c });
var bc = (b, c) => ({ b, c });
var detail = (u, t, n, c) => ({ v: empty, u, t, n, c });
var cache = () => abc(null, null, empty);

// node_modules/uhtml/esm/creator.js
var find = (content, path) => path.reduceRight(childNodesIndex, content);
var childNodesIndex = (node, i) => node.childNodes[i];
var creator_default = (parse) => (template, values) => {
  const { a: fragment, b: entries, c: direct2 } = parse(template, values);
  const root = document.importNode(fragment, true);
  let details = empty;
  if (entries !== empty) {
    details = [];
    for (let current, prev, i = 0;i < entries.length; i++) {
      const { a: path, b: update, c: name } = entries[i];
      const node = path === prev ? current : current = find(root, prev = path);
      details[i] = detail(update, node, name, update === array ? [] : update === hole ? cache() : null);
    }
  }
  return bc(direct2 ? root.firstChild : new PersistentFragment(root), details);
};

// node_modules/domconstants/esm/re.js
var TEXT_ELEMENTS = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
var VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

// node_modules/@webreflection/uparser/esm/index.js
/*! (c) Andrea Giammarchi - ISC */
var elements = /<([a-zA-Z0-9]+[a-zA-Z0-9:._-]*)([^>]*?)(\/?)>/g;
var attributes = /([^\s\\>"'=]+)\s*=\s*(['"]?)\x01/g;
var holes2 = /[\x01\x02]/g;
var esm_default2 = (template, prefix, xml) => {
  let i = 0;
  return template.join("\x01").trim().replace(elements, (_, name, attrs, selfClosing) => `<${name}${attrs.replace(attributes, "\x02=$2$1").trimEnd()}${selfClosing ? xml || VOID_ELEMENTS.test(name) ? " /" : `></${name}` : ""}>`).replace(holes2, (hole2) => hole2 === "\x01" ? `<!--${prefix + i++}-->` : prefix + i++);
};

// node_modules/uhtml/esm/create-content.js
var template = document.createElement("template");
var svg;
var range4;
var create_content_default = (text2, xml) => {
  if (xml) {
    if (!svg) {
      svg = document.createElementNS(SVG_NAMESPACE, "svg");
      range4 = newRange();
      range4.selectNodeContents(svg);
    }
    return range4.createContextualFragment(text2);
  }
  template.innerHTML = text2;
  const { content } = template;
  template = template.cloneNode(false);
  return content;
};

// node_modules/uhtml/esm/parser.js
var createPath = (node) => {
  const path = [];
  let parentNode;
  while (parentNode = node.parentNode) {
    path.push(path.indexOf.call(parentNode.childNodes, node));
    node = parentNode;
  }
  return path;
};
var textNode = () => document.createTextNode("");
var resolve = (template2, values, xml) => {
  const content = create_content_default(esm_default2(template2, prefix, xml), xml);
  const { length } = template2;
  let entries = empty;
  if (length > 1) {
    const replace = [];
    const tw = document.createTreeWalker(content, 1 | 128);
    let i = 0, search = `${prefix}${i++}`;
    entries = [];
    while (i < length) {
      const node = tw.nextNode();
      if (node.nodeType === COMMENT_NODE) {
        if (node.data === search) {
          const update = isArray(values[i - 1]) ? array : hole;
          if (update === hole)
            replace.push(node);
          entries.push(abc(createPath(node), update, null));
          search = `${prefix}${i++}`;
        }
      } else {
        let path;
        while (node.hasAttribute(search)) {
          if (!path)
            path = createPath(node);
          const name = node.getAttribute(search);
          entries.push(abc(path, attribute(node, name, xml), name));
          removeAttribute(node, search);
          search = `${prefix}${i++}`;
        }
        if (!xml && TEXT_ELEMENTS.test(node.localName) && node.textContent.trim() === `<!--${search}-->`) {
          entries.push(abc(path || createPath(node), text, null));
          search = `${prefix}${i++}`;
        }
      }
    }
    for (i = 0;i < replace.length; i++)
      replace[i].replaceWith(textNode());
  }
  const { childNodes } = content;
  let { length: len } = childNodes;
  if (len < 1) {
    len = 1;
    content.appendChild(textNode());
  } else if (len === 1 && length !== 1 && childNodes[0].nodeType !== ELEMENT_NODE) {
    len = 0;
  }
  return set(cache2, template2, abc(content, entries, len === 1));
};
var cache2 = new WeakMap;
var prefix = "is\xB5";
var parser_default = (xml) => (template2, values) => cache2.get(template2) || resolve(template2, values, xml);

// node_modules/uhtml/esm/rabbit.js
var parseHTML = creator_default(parser_default(false));
var parseSVG = creator_default(parser_default(true));
var unroll = (info, { s, t, v }) => {
  if (info.a !== t) {
    const { b, c } = (s ? parseSVG : parseHTML)(t, v);
    info.a = t;
    info.b = b;
    info.c = c;
  }
  for (let { c } = info, i = 0;i < c.length; i++) {
    const value = v[i];
    const detail2 = c[i];
    switch (detail2.u) {
      case array:
        detail2.v = array(detail2.t, unrollValues(detail2.c, value), detail2.v);
        break;
      case hole:
        const current = value instanceof Hole ? unroll(detail2.c || (detail2.c = cache()), value) : (detail2.c = null, value);
        if (current !== detail2.v)
          detail2.v = hole(detail2, current);
        break;
      default:
        if (value !== detail2.v)
          detail2.v = detail2.u(detail2.t, value, detail2.n, detail2.v);
        break;
    }
  }
  return info.b;
};
var unrollValues = (stack, values) => {
  let i = 0, { length } = values;
  if (length < stack.length)
    stack.splice(length);
  for (;i < length; i++) {
    const value = values[i];
    if (value instanceof Hole)
      values[i] = unroll(stack[i] || (stack[i] = cache()), value);
    else
      stack[i] = null;
  }
  return values;
};

class Hole {
  constructor(svg2, template2, values) {
    this.s = svg2;
    this.t = template2;
    this.v = values;
  }
  toDOM(info = cache()) {
    return unroll(info, this);
  }
}

// node_modules/uhtml/esm/render/hole.js
var known = new WeakMap;

// node_modules/uhtml/esm/index.js
/*! (c) Andrea Giammarchi - MIT */
var tag = (svg2) => (template2, ...values) => new Hole(svg2, template2, values);
var html = tag(false);
var svg2 = tag(true);

// node_modules/uhtml/esm/render/shared.js
var known2 = new WeakMap;
var shared_default = (where, what, check) => {
  const info = known2.get(where) || set(known2, where, cache());
  const { b } = info;
  const hole3 = check && typeof what === "function" ? what() : what;
  const node = hole3 instanceof Hole ? hole3.toDOM(info) : hole3;
  if (b !== node)
    where.replaceChildren((info.b = node).valueOf());
  return where;
};

// node_modules/uhtml/esm/render/keyed.js
var keyed_default = (where, what) => shared_default(where, what, true);

// node_modules/uhtml/esm/keyed.js
/*! (c) Andrea Giammarchi - MIT */
var keyed2 = new WeakMap;
var createRef = (svg3) => (ref2, key) => {
  function tag2(template2, ...values) {
    return new Hole(svg3, template2, values).toDOM(this);
  }
  const memo = keyed2.get(ref2) || set(keyed2, ref2, new Map);
  return memo.get(key) || set(memo, key, tag2.bind(cache()));
};
var htmlFor = createRef(false);
var svgFor = createRef(true);
// src/render/shared.js
var classify = function(n) {
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
};
var plain = function(t) {
  if (typeof t === "string") {
    return t;
  }
  for (var s = t[0], i = 1, l = arguments.length;i < l; i++)
    s += arguments[i] + t[i];
  return s;
};
var raw = new Proxy(plain, {
  get(_, k) {
    let f = plain.bind(null);
    f.lang = k;
    return f;
  }
});
var css = raw.css;
// /Users/marshall/code/stabilimentum/packages/zilk/node_modules/orbz/dist/index.js
var stringifyModel = function({ state, derived, entry, orbs, getset, async }) {
  let str = `{\n`;
  str += Object.keys(state).map((k) => `${k}:${parseValue(state[k], k)}`).join(",\n");
  str += ",\n";
  str += Object.keys(derived).map((k) => `${derived[k]}`).join(",\n");
  str += ",\n";
  str += Object.keys(entry).map((k) => `${entry[k]}`).join(",\n");
  str += ",\n";
  str += "}";
  return str;
};
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
        this.#orbs[orb].$((o) => {
        });
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
          toSub.forEach(([orb_key, props]) => {
          });
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
var $Z2 = Symbol("orb-core");
var $L = Symbol("list-core");
var MODEL_SELF = Symbol("m-self");
var SYMBOL_ISMODEL = Symbol("orbz-ismodel");
var Z_DEFS = Symbol("model-def");
var Z_MODEL_IDS = Symbol("model-id");
var MODEL_IMPLEMENTS = Symbol("model-id");
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
    let { value, get, set: set2 } = prop_descs[key];
    if (get && set2) {
      type = "getset";
      def = { get, set: set2 };
    } else if (get) {
      def = get;
      type = "derived";
    } else if (set2) {
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
var stringifyObject = (handler6) => "{" + Object.keys(handler6).map((key) => {
  const { get, set: set2, value } = Object.getOwnPropertyDescriptor(handler6, key);
  if (get && set2)
    key = get + "," + set2;
  else if (get)
    key = "" + get;
  else if (set2)
    key = "" + set2;
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
var parseArray = (array2) => "[" + array2.map(parseValue).join(",") + "]";
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
  svg2 as svg,
  keyed_default as render,
  raw,
  htmlFor,
  html,
  css,
  classify,
  Orb,
  Model
};
