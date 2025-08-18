export function createRouter({ pull='pull', pages = {}, redirects = {} } = {}) {
  // Route storage and lifecycle callbacks
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
  let isRouting = false; // Tracks if a route is in progress
  let canCancel = false; // Tracks if cancelation is still possible


  // Load or initialize custom history stack
  let historyStack = JSON.parse(sessionStorage.getItem('routerHistory') || '[]');
  function saveHistoryStack() {
    sessionStorage.setItem('routerHistory', JSON.stringify(historyStack));
  }

  // Register pages as routes with itty-router's pattern matching
  for (const [pattern, mod] of Object.entries(pages)) {
    const regex = RegExp(
      '^' +
      (('/' + pattern).replace(/\/+(\/|$)/g, '$1'))
        .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')  // Greedy params
        .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // Named params
        .replace(/\./g, '\\.')                          // Escape dots
        .replace(/(\/?)\*/g, '($1.*)?')                 // Wildcard
      + '/*$'
    );
    routes.push({ regex, handler: async req => {
      if(mod[pull]){ req.pull = await mod[pull](req) }
      let [meta, content] = await Promise.all([mod.meta(req),mod.content(req)])
      return { meta, content, req }
    } });
  }

  // Match a path against routes or redirects
  function match(url) {
    const { pathname, searchParams } = new URL(url, location.origin);
    let path = pathname.replace(/\/+$/, '') || '/';

    // Check redirects
    if (redirects[path]) {
      return { redirect: redirects[path] };
    }

    // Parse query params
    const query = {};
    for (let [k, v] of searchParams) {
      query[k] = query[k] ? [].concat(query[k], v) : v;
    }

    // Match routes
    for (const { regex, handler } of routes) {
      const match = path.match(regex);
      if (match) {
        const params = match.groups || {};
        return { handler, params, query };
      }
    }
    return null;
  }

  // Trigger lifecycle callbacks
  function trigger(event, arg) {
    if (event === 'onBefore') {
      // Check if any onBefore callback returns false
      return listeners[event].every(cb => cb(arg) !== false);
    }
    listeners[event].forEach(cb => cb(arg));
    return true; // Default to true for non-onBefore events
  }

  // Perform routing with redirect depth tracking
  async function route(uri, replace = false, redirectDepth = 0,should_render=true) {
    const MAX_REDIRECT_DEPTH = 8;
    uri = uri.replace(/\/+$/, '') || '/';
    const currentPath = location.pathname.replace(/\/+$/, '') || '/';

    if (uri === currentPath && !replace) return;
    // Add to history stack (only on push, not replace)
    if (!replace) {
      historyStack.push(uri);
      saveHistoryStack();
    } else {
      historyStack[historyStack.length - 1] = uri;
      saveHistoryStack();
    }

    if (isRouting) {
      console.warn('Route already in progress, ignoring:', uri);
      return;
    }

    isRouting = true;
    canCancel = true;
    trigger('onStart', uri);

    const matchResult = match(location.origin + uri);
    if (!matchResult) {
      trigger('onError', new Error(`No route found for ${uri}`));
      isRouting = false;
      canCancel = false;
      return;
    }

    if (matchResult.redirect) {
      if (redirectDepth >= MAX_REDIRECT_DEPTH) {
        trigger('onError', new Error(`Redirect depth exceeded (${MAX_REDIRECT_DEPTH}) at ${uri}`));
        isRouting = false;
        canCancel = false;
        return;
      }
      history[replace ? 'replaceState' : 'pushState']({}, '', matchResult.redirect);
      isRouting = false; // Reset before recursive call
      await route(matchResult.redirect, true, redirectDepth + 1);
      return;
    }

    const { handler, params, query } = matchResult;
    const req = { params, query };

    // Check onBefore; cancel if any return false
    if (!trigger('onBefore', req)) {
      trigger('onCancel', uri);
      isRouting = false;
      canCancel = false;
      return;
    }

    try {
      const result = await handler(req);
      trigger('onReady', result);

      if (!canCancel) {
        console.warn('Route canceled too late:', uri);
      } else if (transitionHandler) {
        canCancel = false; // No cancelation after this point
        if(should_render){
          transitionHandler({...result, history: historyStack});
        }
        history[replace ? 'replaceState' : 'pushState']({}, '', uri);
        trigger('onAfter', result);
      } else {
        console.warn('No transition handler set for route:', uri);
      }
    } catch (error) {
      trigger('onError', error);
    } finally {
      isRouting = false;
      canCancel = false;
    }
  }

  // Click handler for navigation
  function clickHandler(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || link.target || link.host !== location.host || href[0] === '#' || link.hasAttribute('download')) return;
    if (href[0] === '/') {
      e.preventDefault();
      route(href);
    }
  }

  // Subscribe to lifecycle events with unsubscribe
  function subscribe(event) {
    return (callback) => {
      listeners[event].push(callback);
      return () => {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      };
    };
  }

  // Router API
  const router = {
    route: route,
    onStart: subscribe('onStart'),
    onBefore: subscribe('onBefore'),
    onReady: subscribe('onReady'),
    onAfter: subscribe('onAfter'),
    onError: subscribe('onError'),
    onCancel: subscribe('onCancel'),
    performTransition(callback) {
      if (transitionHandler) {
        throw new Error('performTransition can only be set once');
      }
      transitionHandler = callback;
    },
    cancel() {
      if (!isRouting || !canCancel) {
        console.warn('Cannot cancel: No active route or cancelation period has passed');
        return;
      }
      trigger('onCancel', location.pathname);
      isRouting = false;
      canCancel = false;
    },
    history: historyStack
  };

  // Take over routing
  wrap('push');
  wrap('replace');
  addEventListener('popstate', () => route(location.pathname + location.search,true));
  addEventListener('replacestate', () => route(location.pathname + location.search,true,0,false));
  addEventListener('pushstate', () => route(location.pathname + location.search,true));
  addEventListener('click', clickHandler);
  // TODO: need?

  return router;
}

function wrap(type, fn) {
	if (history[type]) return;
	history[type] = type;
	fn = history[type += 'State'];
	history[type] = function (uri) {
		var ev = new Event(type.toLowerCase());
		ev.uri = uri;
		fn.apply(this, arguments);
		return dispatchEvent(ev);
	}
}