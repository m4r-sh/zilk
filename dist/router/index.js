// node_modules/regexparam/dist/index.mjs
function parse(str, loose) {
  if (str instanceof RegExp)
    return { keys: false, pattern: str };
  var c, o, tmp, ext, keys = [], pattern = "", arr = str.split("/");
  arr[0] || arr.shift();
  while (tmp = arr.shift()) {
    c = tmp[0];
    if (c === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c === ":") {
      o = tmp.indexOf("?", 1);
      ext = tmp.indexOf(".", 1);
      keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length));
      pattern += !!~o && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
      if (!!~ext)
        pattern += (~o ? "?" : "") + "\\" + tmp.substring(ext);
    } else {
      pattern += "/" + tmp;
    }
  }
  return {
    keys,
    pattern: new RegExp("^" + pattern + (loose ? "(?=$|/)" : "/?$"), "i")
  };
}

// src/router/index.js
function setup({
  on404 = (uri) => {
  },
  root = null,
  callback = () => {
  }
} = {}) {
  if (!is_setup) {
    if (!root) {
      let main = document.getElementsByTagName("main")[0];
      root = main ? main : document.body;
    }
    router = navaid("", on404);
    root_el = root;
    is_setup = true;
    router.listen();
  } else {
    throw "zilk router already setup";
  }
}
function register(pattern, meta, render) {
  if (!is_setup) {
    setup();
  }
  let cb = () => {
    render(root_el);
    window.scrollTo(0, 0);
  };
  router.on(pattern, cb);
  if (pattern.endsWith("index")) {
    router.on(pattern.substring(0, pattern.lastIndexOf("index")), cb);
  }
}
var navaid = function(base, on404) {
  var rgx, curr, routes = [], $ = {};
  var fmt = $.format = function(uri) {
    if (!uri)
      return uri;
    uri = "/" + uri.replace(/^\/|\/$/g, "");
    return rgx.test(uri) && uri.replace(rgx, "/");
  };
  base = "/" + (base || "").replace(/^\/|\/$/g, "");
  rgx = base == "/" ? /^\/+/ : new RegExp("^\\" + base + "(?=\\/|$)\\/?", "i");
  $.route = function(uri, replace) {
    if (uri[0] == "/" && !rgx.test(uri))
      uri = base + uri;
    history[(uri === curr || replace ? "replace" : "push") + "State"](uri, null, uri);
  };
  $.on = function(pat, fn) {
    (pat = parse(pat)).fn = fn;
    routes.push(pat);
    return $;
  };
  $.run = function(uri) {
    var i = 0, params = {}, arr, obj;
    if (uri = fmt(uri || location.pathname)) {
      uri = uri.match(/[^\?#]*/)[0];
      for (curr = uri;i < routes.length; i++) {
        if (arr = (obj = routes[i]).pattern.exec(uri)) {
          for (i = 0;i < obj.keys.length; ) {
            params[obj.keys[i]] = arr[++i] || null;
          }
          obj.fn(params);
          return $;
        }
      }
      if (on404)
        on404(uri);
    }
    return $;
  };
  $.listen = function(u) {
    wrap("push");
    wrap("replace");
    function run(e) {
      $.run();
    }
    function click(e) {
      var x = e.target.closest("a"), y = x && x.getAttribute("href");
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button || e.defaultPrevented)
        return;
      if (!y || x.target || x.host !== location.host || y[0] == "#" || typeof x.getAttribute("download") == "string")
        return;
      if (y[0] != "/" || rgx.test(y)) {
        e.preventDefault();
        $.route(y);
      }
    }
    addEventListener("popstate", run);
    addEventListener("replacestate", run);
    addEventListener("pushstate", run);
    addEventListener("click", click);
    $.unlisten = function() {
      removeEventListener("popstate", run);
      removeEventListener("replacestate", run);
      removeEventListener("pushstate", run);
      removeEventListener("click", click);
    };
    return $;
  };
  return $;
};
var wrap = function(type, fn) {
  if (history[type])
    return;
  history[type] = type;
  fn = history[type += "State"];
  history[type] = function(uri) {
    var ev = new Event(type.toLowerCase());
    ev.uri = uri;
    fn.apply(this, arguments);
    return dispatchEvent(ev);
  };
};
var router;
var root_el = null;
var is_setup = false;
export {
  setup,
  register
};
