// @bun
// node_modules/domconstants/esm/constants.js
var ELEMENT_NODE = 1;
var ATTRIBUTE_NODE = 2;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;

// node_modules/uhtml/esm/dom/symbols.js
var localName = Symbol("localName");
var nodeName = Symbol("nodeName");
var nodeType = Symbol("nodeType");
var documentElement = Symbol("documentElement");
var ownerDocument = Symbol("ownerDocument");
var ownerElement = Symbol("ownerElement");
var childNodes = Symbol("childNodes");
var parentNode = Symbol("parentNode");
var attributes = Symbol("attributes");
var name = Symbol("name");
var value = Symbol("value");

// node_modules/uhtml/esm/dom/utils.js
function setParentNode(node) {
  node[parentNode] = this;
  return node;
}
function withNewParent(node) {
  return changeParentNode(node, this);
}
var changeParentNode = (node, parent) => {
  if (node[nodeType] === DOCUMENT_FRAGMENT_NODE)
    node[childNodes].forEach(setParentNode, parent);
  else {
    if (node[parentNode]) {
      const { [childNodes]: nodes } = node[parentNode];
      nodes.splice(nodes.indexOf(node), 1);
    }
    node[parentNode] = parent;
  }
  return node;
};

// node_modules/uhtml/esm/dom/array.js
var push = (array, nodes) => {
  array.push(...nodes.flatMap(withoutFragments));
};
var splice = (array, start, drop, nodes) => {
  array.splice(start, drop, ...nodes.flatMap(withoutFragments));
};
var unshift = (array, nodes) => {
  array.unshift(...nodes.flatMap(withoutFragments));
};
var withoutFragments = (node) => node[nodeType] === DOCUMENT_FRAGMENT_NODE ? node[childNodes].splice(0) : node;

// node_modules/uhtml/esm/dom/node.js
var map = (values, parent) => values.map(withNewParent, parent);

class Node {
  static {
    this.ELEMENT_NODE = ELEMENT_NODE;
    this.ATTRIBUTE_NODE = ATTRIBUTE_NODE;
    this.TEXT_NODE = TEXT_NODE;
    this.COMMENT_NODE = COMMENT_NODE;
    this.DOCUMENT_NODE = DOCUMENT_NODE;
    this.DOCUMENT_FRAGMENT_NODE = DOCUMENT_FRAGMENT_NODE;
  }
  constructor(type, owner) {
    this[parentNode] = null;
    this[nodeType] = type;
    this[ownerDocument] = owner;
  }
  get parentNode() {
    return this[parentNode];
  }
  get nodeType() {
    return this[nodeType];
  }
  get ownerDocument() {
    return this[ownerDocument];
  }
  get isConnected() {
    let { [parentNode]: parent, [ownerDocument]: owner } = this;
    while (parent && parent !== owner)
      parent = parent[parentNode];
    return parent === owner;
  }
  get parentElement() {
    const { [parentNode]: parent } = this;
    return parent?.[nodeType] === ELEMENT_NODE ? parent : null;
  }
  get previousSibling() {
    const nodes = this[parentNode]?.[childNodes];
    if (nodes) {
      const i = nodes.indexOf(this);
      if (i > 0)
        return nodes[i - 1];
    }
    return null;
  }
  get previousElementSibling() {
    const nodes = this[parentNode]?.[childNodes];
    if (nodes) {
      let i = nodes.indexOf(this);
      while (i-- && nodes[i][nodeType] !== ELEMENT_NODE)
        ;
      return i < 0 ? null : nodes[i];
    }
    return null;
  }
  get nextSibling() {
    const nodes = this[parentNode]?.[childNodes];
    return nodes && nodes.at(nodes.indexOf(this) + 1) || null;
  }
  get nextElementSibling() {
    const nodes = this[parentNode]?.[childNodes];
    if (nodes) {
      let i = nodes.indexOf(this);
      while (++i < nodes.length && nodes[i][nodeType] !== ELEMENT_NODE)
        ;
      return i < nodes.length ? nodes[i] : null;
    }
    return null;
  }
  get childNodes() {
    return [];
  }
  after(...values) {
    const { [parentNode]: parent } = this;
    const { [childNodes]: nodes } = parent;
    const i = nodes.indexOf(this) + 1;
    if (i === nodes.length)
      push(nodes, map(values, parent));
    else if (i)
      splice(nodes, i - 1, 0, map(values, parent));
  }
  before(...values) {
    const { [parentNode]: parent } = this;
    const { [childNodes]: nodes } = parent;
    const i = nodes.indexOf(this);
    if (!i)
      unshift(nodes, map(values, parent));
    else if (i > 0)
      splice(nodes, i, 0, map(values, parent));
  }
  remove() {
    changeParentNode(this, null);
  }
  replaceWith(...values) {
    const { [parentNode]: parent } = this;
    if (parent) {
      const { [childNodes]: nodes } = parent;
      splice(nodes, nodes.indexOf(this), 1, values.map(withNewParent, parent));
      this[parentNode] = null;
    }
  }
}

// node_modules/uhtml/esm/dom/event.js
var _type = Symbol("type");
var _bubbles = Symbol("bubbles");
var _cancelable = Symbol("cancelable");
var _defaultPrevented = Symbol("defaultPrevented");
var _target = Symbol("target");
var _currentTarget = Symbol("currentTarget");
var _stoppedPropagation = Symbol("stoppedPropagation");
var _stoppedImmediatePropagation = Symbol("stoppedImmediatePropagation");

class Event {
  constructor(type, { bubbles = false, cancelable = false } = {}) {
    this[_type] = type;
    this[_bubbles] = bubbles;
    this[_cancelable] = cancelable;
    this[_target] = null;
    this[_currentTarget] = null;
    this[_defaultPrevented] = false;
    this[_stoppedPropagation] = false;
    this[_stoppedImmediatePropagation] = false;
  }
  get type() {
    return this[_type];
  }
  get bubbles() {
    return this[_bubbles];
  }
  get cancelable() {
    return this[_cancelable];
  }
  get target() {
    return this[_target];
  }
  get currentTarget() {
    return this[_currentTarget];
  }
  get defaultPrevented() {
    return this[_defaultPrevented];
  }
  preventDefault() {
    if (this[_cancelable])
      this[_defaultPrevented] = true;
  }
  stopPropagation() {
    this[_stoppedPropagation] = true;
  }
  stopImmediatePropagation() {
    this.stopPropagation();
    this[_stoppedImmediatePropagation] = true;
  }
}

// node_modules/uhtml/esm/dom/parent.js
var listeners = new WeakMap;
var listeners0 = new WeakMap;

// node_modules/uhtml/esm/dom/range.js
var start = Symbol("start");
var end = Symbol("end");

// node_modules/uhtml/esm/dom/document.js
var doctype = Symbol("doctype");
var head = Symbol("head");
var body = Symbol("body");
var defaultView = Object.create(globalThis, {
  Event: { value: Event }
});

// node_modules/uhtml/esm/dom/index.js
/*! (c) Andrea Giammarchi - MIT */

// node_modules/uhtml/esm/init.js
var init_default = (document4) => function(exports) {
  const { constructor: DocumentFragment2 } = document4.createDocumentFragment();
  var udomdiff = (parentNode2, a, b, get, before) => {
    const bLength = b.length;
    let aEnd = a.length;
    let bEnd = bLength;
    let aStart = 0;
    let bStart = 0;
    let map2 = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (aEnd === aStart) {
        const node5 = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0) : before;
        while (bStart < bEnd)
          parentNode2.insertBefore(get(b[bStart++], 1), node5);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map2 || !map2.has(a[aStart]))
            parentNode2.removeChild(get(a[aStart], -1));
          aStart++;
        }
      } else if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
      } else if (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node5 = get(a[--aEnd], -1).nextSibling;
        parentNode2.insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
        parentNode2.insertBefore(get(b[--bEnd], 1), node5);
        a[aEnd] = b[bEnd];
      } else {
        if (!map2) {
          map2 = new Map;
          let i = bStart;
          while (i < bEnd)
            map2.set(b[i], i++);
        }
        if (map2.has(a[aStart])) {
          const index = map2.get(a[aStart]);
          if (bStart < index && index < bEnd) {
            let i = aStart;
            let sequence = 1;
            while (++i < aEnd && i < bEnd && map2.get(a[i]) === index + sequence)
              sequence++;
            if (sequence > index - bStart) {
              const node5 = get(a[aStart], 0);
              while (bStart < index)
                parentNode2.insertBefore(get(b[bStart++], 1), node5);
            } else {
              parentNode2.replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
            }
          } else
            aStart++;
        } else
          parentNode2.removeChild(get(a[aStart++], -1));
      }
    }
    return b;
  };
  const { isArray } = Array;
  const { getPrototypeOf, getOwnPropertyDescriptor } = Object;
  const SVG_NAMESPACE2 = "http://www.w3.org/2000/svg";
  const empty2 = [];
  const newRange = () => document4.createRange();
  const set = (map2, key, value2) => {
    map2.set(key, value2);
    return value2;
  };
  const gPD = (ref2, prop) => {
    let desc;
    do {
      desc = getOwnPropertyDescriptor(ref2, prop);
    } while (!desc && (ref2 = getPrototypeOf(ref2)));
    return desc;
  };
  const ELEMENT_NODE2 = 1;
  const COMMENT_NODE2 = 8;
  const DOCUMENT_FRAGMENT_NODE2 = 11;
  /*! (c) Andrea Giammarchi - ISC */
  const { setPrototypeOf } = Object;
  var custom = (Class) => {
    function Custom(target) {
      return setPrototypeOf(target, new.target.prototype);
    }
    Custom.prototype = Class.prototype;
    return Custom;
  };
  let range$1;
  var drop = (firstChild, lastChild, preserve) => {
    if (!range$1)
      range$1 = newRange();
    if (preserve)
      range$1.setStartAfter(firstChild);
    else
      range$1.setStartBefore(firstChild);
    range$1.setEndAfter(lastChild);
    range$1.deleteContents();
    return firstChild;
  };
  const remove = ({ firstChild, lastChild }, preserve) => drop(firstChild, lastChild, preserve);
  let checkType = false;
  const diffFragment = (node5, operation) => checkType && node5.nodeType === DOCUMENT_FRAGMENT_NODE2 ? 1 / operation < 0 ? operation ? remove(node5, true) : node5.lastChild : operation ? node5.valueOf() : node5.firstChild : node5;
  const comment3 = (value2) => document4.createComment(value2);

  class PersistentFragment extends custom(DocumentFragment2) {
    #firstChild = comment3("<>");
    #lastChild = comment3("</>");
    #nodes = empty2;
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
    replaceWith(node5) {
      remove(this, true).replaceWith(node5);
    }
    valueOf() {
      let { firstChild, lastChild, parentNode: parentNode2 } = this;
      if (parentNode2 === this) {
        if (this.#nodes === empty2)
          this.#nodes = [...this.childNodes];
      } else {
        if (parentNode2) {
          this.#nodes = [firstChild];
          while (firstChild !== lastChild)
            this.#nodes.push(firstChild = firstChild.nextSibling);
        }
        this.replaceChildren(...this.#nodes);
      }
      return this;
    }
  }
  const setAttribute = (element5, name2, value2) => element5.setAttribute(name2, value2);
  const removeAttribute = (element5, name2) => element5.removeAttribute(name2);
  const aria = (element5, value2) => {
    for (const key in value2) {
      const $ = value2[key];
      const name2 = key === "role" ? key : `aria-${key}`;
      if ($ == null)
        removeAttribute(element5, name2);
      else
        setAttribute(element5, name2, $);
    }
    return value2;
  };
  let listeners2;
  const at = (element5, value2, name2) => {
    name2 = name2.slice(1);
    if (!listeners2)
      listeners2 = new WeakMap;
    const known2 = listeners2.get(element5) || set(listeners2, element5, {});
    let current = known2[name2];
    if (current && current[0])
      element5.removeEventListener(name2, ...current);
    current = isArray(value2) ? value2 : [value2, false];
    known2[name2] = current;
    if (current[0])
      element5.addEventListener(name2, ...current);
    return value2;
  };
  const hole = (detail2, value2) => {
    const { t: node5, n: hole2 } = detail2;
    let nullish = false;
    switch (typeof value2) {
      case "object":
        if (value2 !== null) {
          (hole2 || node5).replaceWith(detail2.n = value2.valueOf());
          break;
        }
      case "undefined":
        nullish = true;
      default:
        node5.data = nullish ? "" : value2;
        if (hole2) {
          detail2.n = null;
          hole2.replaceWith(node5);
        }
        break;
    }
    return value2;
  };
  const className = (element5, value2) => maybeDirect(element5, value2, value2 == null ? "class" : "className");
  const data = (element5, value2) => {
    const { dataset } = element5;
    for (const key in value2) {
      if (value2[key] == null)
        delete dataset[key];
      else
        dataset[key] = value2[key];
    }
    return value2;
  };
  const direct = (ref2, value2, name2) => ref2[name2] = value2;
  const dot = (element5, value2, name2) => direct(element5, value2, name2.slice(1));
  const maybeDirect = (element5, value2, name2) => value2 == null ? (removeAttribute(element5, name2), value2) : direct(element5, value2, name2);
  const ref = (element5, value2) => (typeof value2 === "function" ? value2(element5) : value2.current = element5, value2);
  const regular = (element5, value2, name2) => (value2 == null ? removeAttribute(element5, name2) : setAttribute(element5, name2, value2), value2);
  const style = (element5, value2) => value2 == null ? maybeDirect(element5, value2, "style") : direct(element5.style, value2, "cssText");
  const toggle = (element5, value2, name2) => (element5.toggleAttribute(name2.slice(1), value2), value2);
  const array3 = (node5, value2, prev) => {
    const { length } = value2;
    node5.data = `[${length}]`;
    if (length)
      return udomdiff(node5.parentNode, prev, value2, diffFragment, node5);
    switch (prev.length) {
      case 1:
        prev[0].remove();
      case 0:
        break;
      default:
        drop(diffFragment(prev[0], 0), diffFragment(prev.at(-1), -0), false);
        break;
    }
    return empty2;
  };
  const attr = new Map([
    ["aria", aria],
    ["class", className],
    ["data", data],
    ["ref", ref],
    ["style", style]
  ]);
  const attribute4 = (element5, name2, svg2) => {
    switch (name2[0]) {
      case ".":
        return dot;
      case "?":
        return toggle;
      case "@":
        return at;
      default:
        return svg2 || "ownerSVGElement" in element5 ? name2 === "ref" ? ref : regular : attr.get(name2) || (name2 in element5 ? name2.startsWith("on") ? direct : gPD(element5, name2)?.set ? maybeDirect : regular : regular);
    }
  };
  const text4 = (element5, value2) => (element5.textContent = value2 == null ? "" : value2, value2);
  const abc = (a, b, c) => ({ a, b, c });
  const bc = (b, c) => ({ b, c });
  const detail = (u, t, n, c) => ({ v: empty2, u, t, n, c });
  const cache$1 = () => abc(null, null, empty2);
  const find = (content, path) => path.reduceRight(childNodesIndex, content);
  const childNodesIndex = (node5, i) => node5.childNodes[i];
  var create = (parse2) => (template2, values) => {
    const { a: fragment, b: entries, c: direct2 } = parse2(template2, values);
    const root = document4.importNode(fragment, true);
    let details = empty2;
    if (entries !== empty2) {
      details = [];
      for (let current, prev, i = 0;i < entries.length; i++) {
        const { a: path, b: update, c: name2 } = entries[i];
        const node5 = path === prev ? current : current = find(root, prev = path);
        details[i] = detail(update, node5, name2, update === array3 ? [] : update === hole ? cache$1() : null);
      }
    }
    return bc(direct2 ? root.firstChild : new PersistentFragment(root), details);
  };
  const TEXT_ELEMENTS2 = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
  const VOID_ELEMENTS2 = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
  /*! (c) Andrea Giammarchi - ISC */
  const elements = /<([a-zA-Z0-9]+[a-zA-Z0-9:._-]*)([^>]*?)(\/?)>/g;
  const attributes2 = /([^\s\\>"'=]+)\s*=\s*(['"]?)\x01/g;
  const holes = /[\x01\x02]/g;
  var parser$1 = (template2, prefix2, xml) => {
    let i = 0;
    return template2.join("\x01").trim().replace(elements, (_, name2, attrs, selfClosing) => `<${name2}${attrs.replace(attributes2, "\x02=$2$1").trimEnd()}${selfClosing ? xml || VOID_ELEMENTS2.test(name2) ? " /" : `></${name2}` : ""}>`).replace(holes, (hole2) => hole2 === "\x01" ? `<!--${prefix2 + i++}-->` : prefix2 + i++);
  };
  let template = document4.createElement("template"), svg$1, range2;
  var createContent = (text5, xml) => {
    if (xml) {
      if (!svg$1) {
        svg$1 = document4.createElementNS(SVG_NAMESPACE2, "svg");
        range2 = newRange();
        range2.selectNodeContents(svg$1);
      }
      return range2.createContextualFragment(text5);
    }
    template.innerHTML = text5;
    const { content } = template;
    template = template.cloneNode(false);
    return content;
  };
  const createPath = (node5) => {
    const path = [];
    let parentNode2;
    while (parentNode2 = node5.parentNode) {
      path.push(path.indexOf.call(parentNode2.childNodes, node5));
      node5 = parentNode2;
    }
    return path;
  };
  const textNode = () => document4.createTextNode("");
  const resolve = (template2, values, xml) => {
    const content = createContent(parser$1(template2, prefix, xml), xml);
    const { length } = template2;
    let entries = empty2;
    if (length > 1) {
      const replace = [];
      const tw = document4.createTreeWalker(content, 1 | 128);
      let i = 0, search = `${prefix}${i++}`;
      entries = [];
      while (i < length) {
        const node5 = tw.nextNode();
        if (node5.nodeType === COMMENT_NODE2) {
          if (node5.data === search) {
            const update = isArray(values[i - 1]) ? array3 : hole;
            if (update === hole)
              replace.push(node5);
            entries.push(abc(createPath(node5), update, null));
            search = `${prefix}${i++}`;
          }
        } else {
          let path;
          while (node5.hasAttribute(search)) {
            if (!path)
              path = createPath(node5);
            const name2 = node5.getAttribute(search);
            entries.push(abc(path, attribute4(node5, name2, xml), name2));
            removeAttribute(node5, search);
            search = `${prefix}${i++}`;
          }
          if (!xml && TEXT_ELEMENTS2.test(node5.localName) && node5.textContent.trim() === `<!--${search}-->`) {
            entries.push(abc(path || createPath(node5), text4, null));
            search = `${prefix}${i++}`;
          }
        }
      }
      for (i = 0;i < replace.length; i++)
        replace[i].replaceWith(textNode());
    }
    const { childNodes: childNodes2 } = content;
    let { length: len } = childNodes2;
    if (len < 1) {
      len = 1;
      content.appendChild(textNode());
    } else if (len === 1 && length !== 1 && childNodes2[0].nodeType !== ELEMENT_NODE2) {
      len = 0;
    }
    return set(cache, template2, abc(content, entries, len === 1));
  };
  const cache = new WeakMap;
  const prefix = "is\xB5";
  var parser = (xml) => (template2, values) => cache.get(template2) || resolve(template2, values, xml);
  const parseHTML = create(parser(false));
  const parseSVG = create(parser(true));
  const unroll = (info, { s, t, v }) => {
    if (info.a !== t) {
      const { b, c } = (s ? parseSVG : parseHTML)(t, v);
      info.a = t;
      info.b = b;
      info.c = c;
    }
    for (let { c } = info, i = 0;i < c.length; i++) {
      const value2 = v[i];
      const detail2 = c[i];
      switch (detail2.u) {
        case array3:
          detail2.v = array3(detail2.t, unrollValues(detail2.c, value2), detail2.v);
          break;
        case hole:
          const current = value2 instanceof Hole ? unroll(detail2.c || (detail2.c = cache$1()), value2) : (detail2.c = null, value2);
          if (current !== detail2.v)
            detail2.v = hole(detail2, current);
          break;
        default:
          if (value2 !== detail2.v)
            detail2.v = detail2.u(detail2.t, value2, detail2.n, detail2.v);
          break;
      }
    }
    return info.b;
  };
  const unrollValues = (stack, values) => {
    let i = 0, { length } = values;
    if (length < stack.length)
      stack.splice(length);
    for (;i < length; i++) {
      const value2 = values[i];
      if (value2 instanceof Hole)
        values[i] = unroll(stack[i] || (stack[i] = cache$1()), value2);
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
    toDOM(info = cache$1()) {
      return unroll(info, this);
    }
  }
  /*! (c) Andrea Giammarchi - MIT */
  const tag = (svg2) => (template2, ...values) => new Hole(svg2, template2, values);
  const html = tag(false);
  const svg = tag(true);
  const known = new WeakMap;
  var render = (where, what, check) => {
    const info = known.get(where) || set(known, where, cache$1());
    const { b } = info;
    const hole2 = check && typeof what === "function" ? what() : what;
    const node5 = hole2 instanceof Hole ? hole2.toDOM(info) : hole2;
    if (b !== node5)
      where.replaceChildren((info.b = node5).valueOf());
    return where;
  };
  var keyed$1 = (where, what) => render(where, what, true);
  /*! (c) Andrea Giammarchi - MIT */
  const keyed = new WeakMap;
  const createRef = (svg2) => (ref2, key) => {
    function tag2(template2, ...values) {
      return new Hole(svg2, template2, values).toDOM(this);
    }
    const memo = keyed.get(ref2) || set(keyed, ref2, new Map);
    return memo.get(key) || set(memo, key, tag2.bind(cache$1()));
  };
  const htmlFor = createRef(false);
  const svgFor = createRef(true);
  exports.Hole = Hole;
  exports.attr = attr;
  exports.html = html;
  exports.htmlFor = htmlFor;
  exports.render = keyed$1;
  exports.svg = svg;
  exports.svgFor = svgFor;
  return exports;
}({});

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

// src/render/server.js
var { Hole, render, html, svg, htmlFor, svgFor, attr } = init_default(document);
// /Users/marshall/code/stabilimentum/packages/zilk/node_modules/orbz/build/bun/index.js
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
var prefix = "";
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
  #isLocal() {
    return curr_get == this || !this.#init_done;
  }
  #watch_get(key) {
    let len = get_stack.length;
    if (len != 0) {
      get_stack[len - 1].add(prefix + key);
      prefix = "";
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
    let { value: value2, get, set } = prop_descs[key];
    if (get && set) {
      type = "getset";
      def = { get, set };
    } else if (get) {
      def = get;
      type = "derived";
    } else if (set) {
      console.log("TODO: lone setter");
    } else {
      def = value2;
      if (typeof value2 == "function") {
        if (value2 instanceof Model) {
          type = "orbs";
        } else if (value2.constructor.name == "AsyncFunction") {
          type = "async";
        } else {
          type = "entry";
        }
      } else {
        if (value2 == MODEL_SELF) {
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
var stringifyObject = (handler) => "{" + Object.keys(handler).map((key) => {
  const { get, set, value: value2 } = Object.getOwnPropertyDescriptor(handler, key);
  if (get && set)
    key = get + "," + set;
  else if (get)
    key = "" + get;
  else if (set)
    key = "" + set;
  else
    key = JSON.stringify(key) + ":" + parseValue(value2, key);
  return key;
}).join(",") + "}";
var parseValue = (value2, key) => {
  const type = typeof value2;
  if (type === "function")
    return value2.toString().replace(new RegExp("^(\\*|async )?\\s*" + key + "[^(]*?\\("), (_, $1) => $1 === "*" ? "function* (" : ($1 || "") + "function (");
  if (type === "object" && value2)
    return Array.isArray(value2) ? parseArray(value2) : stringifyObject(value2);
  return JSON.stringify(value2);
};
var parseArray = (array3) => "[" + array3.map(parseValue).join(",") + "]";
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
  Model
};
