// src/router/index.js
function createRouter({ pages = {}, redirects = {} } = {}) {
  const routes = [];
  const listeners = {
    onStart: [],
    onBefore: [],
    onReady: [],
    onAfter: [],
    onError: [],
    onCancel: []
  };
  let transitionHandler = null;
  let isRouting = false;
  let canCancel = false;
  for (const [pattern, handler] of Object.entries(pages)) {
    const regex = RegExp("^" + ("/" + pattern).replace(/\/+(\/|$)/g, "$1").replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?") + "/*$");
    routes.push({ regex, handler });
  }
  function match(url) {
    const { pathname, searchParams } = new URL(url, location.origin);
    let path = pathname.replace(/\/+$/, "") || "/";
    if (redirects[path]) {
      return { redirect: redirects[path] };
    }
    const query = {};
    for (let [k, v] of searchParams) {
      query[k] = query[k] ? [].concat(query[k], v) : v;
    }
    for (const { regex, handler } of routes) {
      const match2 = path.match(regex);
      if (match2) {
        const params = match2.groups || {};
        return { handler, params, query };
      }
    }
    return null;
  }
  function trigger(event, arg) {
    if (event === "onBefore") {
      return listeners[event].every((cb) => cb(arg) !== false);
    }
    listeners[event].forEach((cb) => cb(arg));
    return true;
  }
  async function route(uri, replace = false, redirectDepth = 0) {
    console.log("route to " + uri + " : " + replace + " " + redirectDepth);
    const MAX_REDIRECT_DEPTH = 8;
    uri = uri.replace(/\/+$/, "") || "/";
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";
    if (uri === currentPath && !replace)
      return;
    if (isRouting) {
      console.warn("Route already in progress, ignoring:", uri);
      return;
    }
    isRouting = true;
    canCancel = true;
    trigger("onStart", uri);
    const matchResult = match(location.origin + uri);
    if (!matchResult) {
      trigger("onError", new Error(`No route found for ${uri}`));
      isRouting = false;
      canCancel = false;
      return;
    }
    if (matchResult.redirect) {
      if (redirectDepth >= MAX_REDIRECT_DEPTH) {
        trigger("onError", new Error(`Redirect depth exceeded (${MAX_REDIRECT_DEPTH}) at ${uri}`));
        isRouting = false;
        canCancel = false;
        return;
      }
      console.log(matchResult, replace);
      history[replace ? "replaceState" : "pushState"]({}, "", matchResult.redirect);
      isRouting = false;
      await route(matchResult.redirect, true, redirectDepth + 1);
      return;
    }
    const { handler, params, query } = matchResult;
    const req = { params, query };
    if (!trigger("onBefore", req)) {
      trigger("onCancel", uri);
      isRouting = false;
      canCancel = false;
      return;
    }
    try {
      const result = await handler(req);
      trigger("onReady", result);
      if (!canCancel) {
        console.warn("Route canceled too late:", uri);
      } else if (transitionHandler) {
        canCancel = false;
        transitionHandler(result);
        history[replace ? "replaceState" : "pushState"]({}, "", uri);
        trigger("onAfter", result);
      } else {
        console.warn("No transition handler set for route:", uri);
      }
    } catch (error) {
      trigger("onError", error);
    } finally {
      isRouting = false;
      canCancel = false;
    }
  }
  function clickHandler(e) {
    const link = e.target.closest("a");
    if (!link)
      return;
    const href = link.getAttribute("href");
    if (!href || link.target || link.host !== location.host || href[0] === "#" || link.hasAttribute("download"))
      return;
    if (href[0] === "/") {
      e.preventDefault();
      route(href);
    }
  }
  function subscribe(event) {
    return (callback) => {
      listeners[event].push(callback);
      return () => {
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
      };
    };
  }
  const router = {
    onStart: subscribe("onStart"),
    onBefore: subscribe("onBefore"),
    onReady: subscribe("onReady"),
    onAfter: subscribe("onAfter"),
    onError: subscribe("onError"),
    onCancel: subscribe("onCancel"),
    performTransition(callback) {
      if (transitionHandler) {
        throw new Error("performTransition can only be set once");
      }
      transitionHandler = callback;
    },
    cancel() {
      if (!isRouting || !canCancel) {
        console.warn("Cannot cancel: No active route or cancelation period has passed");
        return;
      }
      trigger("onCancel", location.pathname);
      isRouting = false;
      canCancel = false;
    }
  };
  wrap("push");
  wrap("replace");
  addEventListener("popstate", () => route(location.pathname, true));
  addEventListener("replacestate", () => route(location.pathname, true));
  addEventListener("pushstate", () => route(location.pathname, true));
  addEventListener("click", clickHandler);
  return router;
}
function wrap(type, fn) {
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
}
export {
  createRouter
};
