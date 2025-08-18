import { patternToRegex, matchPath, parseQuery } from './utils.js';

export function createRouter({ pages = {}, redirects = {} } = {}) {
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
  let isRouting = false;
  let canCancel = false;

  // Register pages as routes
  for (const [pattern, handler] of Object.entries(pages)) {
    const regex = patternToRegex(pattern);
    routes.push({ regex, handler });
  }

  // Match a path against routes or redirects
  function match(url) {
    const { pathname } = new URL(url, location.origin);
    const query = parseQuery(url);
    const matchResult = matchPath(pathname, pages, redirects);
    
    if (!matchResult) return null;
    if (matchResult.redirect) return { redirect: matchResult.redirect };
    
    return { ...matchResult, query };
  }

  // Trigger lifecycle callbacks
  function trigger(event, arg) {
    if (event === 'onBefore') {
      return listeners[event].every(cb => cb(arg) !== false);
    }
    listeners[event].forEach(cb => cb(arg));
    return true;
  }

  // Perform routing with redirect depth tracking
  async function route(uri, replace = false, redirectDepth = 0) {
    const MAX_REDIRECT_DEPTH = 8;
    uri = uri.replace(/\/+$/, '') || '/';
    const currentPath = location.pathname.replace(/\/+$/, '') || '/';

    if (uri === currentPath && !replace) return;

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
      isRouting = false;
      await route(matchResult.redirect, true, redirectDepth + 1);
      return;
    }

    const { handler, params, query } = matchResult;
    const req = { params, query };

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
        canCancel = false;
        transitionHandler(result);
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
    }
  };

  // Take over routing
  wrap('push');
  wrap('replace');
  addEventListener('popstate', () => route(location.pathname, true));
  addEventListener('replacestate', () => route(location.pathname, true));
  addEventListener('pushstate', () => route(location.pathname, true));
  addEventListener('click', clickHandler);

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