// node_modules/@webreflection/lie/esm/index.js
var esm_default = typeof Promise === "function" ? Promise : function(fn) {
  let queue = [], resolved = 0, value;
  fn(($) => {
    value = $;
    resolved = 1;
    queue.splice(0).forEach(then);
  });
  return { then };
  function then(fn2) {
    return resolved ? setTimeout(fn2, 0, value) : queue.push(fn2), this;
  }
};

// node_modules/element-notifier/esm/index.js
var add = function(node) {
  this.observe(node, { subtree: TRUE, childList: TRUE });
};
var TRUE = true;
var FALSE = false;
var QSA = "querySelectorAll";
var notify = (callback, root, MO) => {
  const loop = (nodes, added, removed, connected, pass) => {
    for (let i = 0, { length } = nodes;i < length; i++) {
      const node = nodes[i];
      if (pass || QSA in node) {
        if (connected) {
          if (!added.has(node)) {
            added.add(node);
            removed.delete(node);
            callback(node, connected);
          }
        } else if (!removed.has(node)) {
          removed.add(node);
          added.delete(node);
          callback(node, connected);
        }
        if (!pass)
          loop(node[QSA]("*"), added, removed, connected, TRUE);
      }
    }
  };
  const observer = new (MO || MutationObserver)((records) => {
    for (let added = new Set, removed = new Set, i = 0, { length } = records;i < length; i++) {
      const { addedNodes, removedNodes } = records[i];
      loop(removedNodes, added, removed, FALSE, FALSE);
      loop(addedNodes, added, removed, TRUE, FALSE);
    }
  });
  observer.add = add;
  observer.add(root || document);
  return observer;
};

// node_modules/qsa-observer/esm/index.js
var QSA2 = "querySelectorAll";
var { document: document2, Element, MutationObserver: MutationObserver2, Set: Set2, WeakMap: WeakMap2 } = self;
var elements = (element) => (QSA2 in element);
var { filter } = [];
var esm_default2 = (options) => {
  const live = new WeakMap2;
  const drop = (elements2) => {
    for (let i = 0, { length } = elements2;i < length; i++)
      live.delete(elements2[i]);
  };
  const flush = () => {
    const records = observer.takeRecords();
    for (let i = 0, { length } = records;i < length; i++) {
      parse(filter.call(records[i].removedNodes, elements), false);
      parse(filter.call(records[i].addedNodes, elements), true);
    }
  };
  const matches = (element) => element.matches || element.webkitMatchesSelector || element.msMatchesSelector;
  const notifier = (element, connected) => {
    let selectors;
    if (connected) {
      for (let q, m = matches(element), i = 0, { length } = query;i < length; i++) {
        if (m.call(element, q = query[i])) {
          if (!live.has(element))
            live.set(element, new Set2);
          selectors = live.get(element);
          if (!selectors.has(q)) {
            selectors.add(q);
            options.handle(element, connected, q);
          }
        }
      }
    } else if (live.has(element)) {
      selectors = live.get(element);
      live.delete(element);
      selectors.forEach((q) => {
        options.handle(element, connected, q);
      });
    }
  };
  const parse = (elements2, connected = true) => {
    for (let i = 0, { length } = elements2;i < length; i++)
      notifier(elements2[i], connected);
  };
  const { query } = options;
  const root = options.root || document2;
  const observer = notify(notifier, root, MutationObserver2);
  const { attachShadow } = Element.prototype;
  if (attachShadow)
    Element.prototype.attachShadow = function(init) {
      const shadowRoot = attachShadow.call(this, init);
      observer.add(shadowRoot);
      return shadowRoot;
    };
  if (query.length)
    parse(root[QSA2](query));
  return { drop, flush, observer, parse };
};

// node_modules/wicked-elements/esm/index.js
var { create, keys } = Object;
var attributes = new WeakMap;
var lazy = new Set;
var query = [];
var config = {};
var defined = {};
var attributeChangedCallback = (records, o) => {
  for (let h = attributes.get(o), i = 0, { length } = records;i < length; i++) {
    const { target, attributeName, oldValue } = records[i];
    const newValue = target.getAttribute(attributeName);
    h.attributeChanged(attributeName, oldValue, newValue);
  }
};
var set = (value, m, l, o) => {
  const handler = create(o, { element: { enumerable: true, value } });
  for (let i = 0, { length } = l;i < length; i++)
    value.addEventListener(l[i].t, handler, l[i].o);
  m.set(value, handler);
  if (handler.init)
    handler.init();
  const { observedAttributes } = o;
  if (observedAttributes) {
    const mo = new MutationObserver(attributeChangedCallback);
    mo.observe(value, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: observedAttributes.map((attributeName) => {
        if (value.hasAttribute(attributeName))
          handler.attributeChanged(attributeName, null, value.getAttribute(attributeName));
        return attributeName;
      })
    });
    attributes.set(mo, handler);
  }
  return handler;
};
var { drop, flush, parse } = esm_default2({
  query,
  handle(element, connected, selector) {
    const { m, l, o } = config[selector];
    const handler = m.get(element) || set(element, m, l, o);
    const method = connected ? "connected" : "disconnected";
    if (method in handler)
      handler[method]();
  }
});
var define = (selector, definition) => {
  if (-1 < query.indexOf(selector))
    throw new Error("duplicated: " + selector);
  flush();
  const listeners = [];
  const retype = create(null);
  for (let k = keys(definition), i = 0, { length } = k;i < length; i++) {
    const key = k[i];
    if (/^on/.test(key) && !/Options$/.test(key)) {
      const options = definition[key + "Options"] || false;
      const lower = key.toLowerCase();
      let type = lower.slice(2);
      listeners.push({ t: type, o: options });
      retype[type] = key;
      if (lower !== key) {
        type = key.slice(2, 3).toLowerCase() + key.slice(3);
        retype[type] = key;
        listeners.push({ t: type, o: options });
      }
    }
  }
  if (listeners.length) {
    definition.handleEvent = function(event) {
      this[retype[event.type]](event);
    };
  }
  query.push(selector);
  config[selector] = { m: new WeakMap, l: listeners, o: definition };
  parse(document.querySelectorAll(selector));
  whenDefined(selector);
  if (!lazy.has(selector))
    defined[selector]._();
};
var defineAsync = (selector, callback, _) => {
  lazy.add(selector);
  define(selector, {
    init() {
      if (lazy.has(selector)) {
        lazy.delete(selector);
        callback().then(({ default: definition }) => {
          query.splice(query.indexOf(selector), 1);
          drop(document.querySelectorAll(selector));
          (_ || define)(selector, definition);
        });
      }
    }
  });
};
var whenDefined = (selector) => {
  if (!(selector in defined)) {
    let _, $ = new esm_default(($2) => {
      _ = $2;
    });
    defined[selector] = { _, $ };
  }
  return defined[selector].$;
};

// src/hydrate/index.js
function saturateAsync(locations) {
  for (let k in locations) {
    defineAsync("." + k, () => locations[k]().then((mod) => ({
      default: normalize(mod.handlers[k])
    })));
  }
}
function saturate(definitions) {
  for (let k in definitions) {
    define("." + k, normalize(definitions[k]));
  }
}
var toQuery = (x) => x && x[Symbol.toStringTag] === "classified" ? "." + x : x;
var normalize = (o) => ({
  ...o,
  $(x) {
    return this.element.querySelector(toQuery(x));
  },
  $$(x) {
    return [...this.element.querySelectorAll(toQuery(x))];
  },
  init() {
    this.el = this.element;
    if (o.init && typeof o.init == "function") {
      o.init.apply(this, []);
    }
  }
});
export {
  saturateAsync,
  saturate
};
