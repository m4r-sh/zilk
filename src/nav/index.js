import { patternToRegex, routeEntries } from './utils.js';

export function createRouter({ pull = 'pull', pages = {}, redirects = {} } = {}) {
  /* ------------------------------------------------------------------ */
  /* Internal State                                                     */
  /* ------------------------------------------------------------------ */

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
  const MAX_REDIRECT_DEPTH = 8;

  /* ------------------------------------------------------------------ */
  /* Internal History (authoritative)                                   */
  /* ------------------------------------------------------------------ */

  const HISTORY_KEY = 'router:history';
  const SCROLL_KEY = 'router:scroll';

  let historyState = loadHistory();
  let scrollState = loadScroll();

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (!raw) throw 0;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.stack)) throw 0;
      return parsed;
    } catch {
      return {
        stack: [normalize(location.pathname + location.search)],
        index: 0
      };
    }
  }

  function saveHistory() {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyState));
  }

  function loadScroll() {
    try {
      return JSON.parse(sessionStorage.getItem(SCROLL_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveScrollState() {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(scrollState));
  }

  function saveScroll(url) {
    scrollState[url] = {
      x: window.scrollX,
      y: window.scrollY
    };
    saveScrollState();
  }

  function restoreScroll(url) {
    const pos = scrollState[url];
    if (!pos) return;
    requestAnimationFrame(() => {
      window.scrollTo(pos.x, pos.y);
    });
  }

  function current() {
    return historyState.stack[historyState.index];
  }

  function canBack() {
    return historyState.index > 0;
  }

  function canForward() {
    return historyState.index < historyState.stack.length - 1;
  }

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */

  function normalize(url) {
    const u = new URL(url, location.origin);
    const path = u.pathname.replace(/\/+$/, '') || '/';
    return path + u.search;
  }

  function trigger(event, arg) {
    if (event === 'onBefore') {
      return listeners[event].every(cb => cb(arg) !== false);
    }
    listeners[event].forEach(cb => cb(arg));
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Route Registration                                                 */
  /* ------------------------------------------------------------------ */

  for (const [pattern, mod] of routeEntries(pages)) {
    const regex = patternToRegex(pattern);
    routes.push({
      regex,
      handler: async (req) => {
        if (mod[pull]) req.pull = await mod[pull](req);
        const [meta, content] = await Promise.all([
          mod.meta(req),
          mod.content(req)
        ]);
        return { meta, content, req };
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Matching                                                           */
  /* ------------------------------------------------------------------ */

  function match(url) {
    const u = new URL(url, location.origin);
    const path = normalize(u.pathname);

    if (redirects[path]) {
      return { redirect: redirects[path] };
    }

    const query = {};
    for (const [k, v] of u.searchParams) {
      query[k] = query[k] ? [].concat(query[k], v) : v;
    }

    for (const { regex, handler } of routes) {
      const m = path.match(regex);
      if (m) {
        return { handler, params: m.groups || {}, query };
      }
    }

    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Core Render                                                        */
  /* ------------------------------------------------------------------ */

  async function render(url, source, redirectDepth = 0) {
    if (isRouting) return;
    isRouting = true;

    trigger('onStart', { url, source });

    const matchResult = match(url);
    if (!matchResult) {
      trigger('onError', new Error(`No route found for ${url}`));
      isRouting = false;
      return;
    }

    if (matchResult.redirect) {
      if (redirectDepth >= MAX_REDIRECT_DEPTH) {
        trigger('onError', new Error(
          `Redirect depth exceeded (${MAX_REDIRECT_DEPTH}) at ${url}`
        ));
        isRouting = false;
        return;
      }

      const next = normalize(matchResult.redirect);

      // Replace URL in browser + internal history
      historyState.stack[historyState.index] = next;
      history.replaceState(null, '', next);
      saveHistory();

      // Continue rendering with redirected URL
      isRouting = false;
      render(next, 'redirect', redirectDepth + 1);
      return;
    }


    const { handler, params, query } = matchResult;
    const req = { params, query };

    if (!trigger('onBefore', req)) {
      trigger('onCancel', url);
      isRouting = false;
      return;
    }

    try {
      const result = await handler(req);
      trigger('onReady', result);

      if (transitionHandler) {
        transitionHandler({
          ...result,
          history: historyState.stack,
          index: historyState.index,
          source
        });
      }

      if (source === 'history' || source === 'back' || source === 'forward') {
        restoreScroll(url);
      } else {
        window.scrollTo(0, 0);
      }

      trigger('onAfter', result);
    } catch (err) {
      trigger('onError', err);
    } finally {
      isRouting = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Navigation API (public)                                            */
  /* ------------------------------------------------------------------ */

  function route(url, { replace = false, source = 'programmatic' } = {}) {
    const next = normalize(url);
    const curr = current();

    if (next === curr && !replace) return;

    if (replace) {
      historyState.stack[historyState.index] = next;
      history.replaceState(null, '', next);
    } else {
      historyState.stack.length = historyState.index + 1;
      historyState.stack.push(next);
      historyState.index++;
      history.pushState(null, '', next);
    }

    saveHistory();
    render(next, source);
  }

  function back(fallback = '/') {
    if (canBack()) {
      saveScroll(current());
      historyState.index--;
      const url = current();
      history.replaceState(null, '', url);
      saveHistory();
      render(url, 'back');
    } else {
      route(fallback, { replace: true, source: 'fallback' });
    }
  }

  function forward() {
    if (!canForward()) return;
    saveScroll(current());
    historyState.index++;
    const url = current();
    history.replaceState(null, '', url);
    saveHistory();
    render(url, 'forward');
  }

  /* ------------------------------------------------------------------ */
  /* Browser Back / Forward                                             */
  /* ------------------------------------------------------------------ */

  addEventListener('popstate', () => {
    saveScroll(current());

    const url = normalize(location.pathname + location.search);
    const idx = historyState.stack.indexOf(url);

    if (idx !== -1) {
      historyState.index = idx;
    } else {
      historyState.stack = [url];
      historyState.index = 0;
    }

    saveHistory();
    render(url, 'history');
  });

  /* ------------------------------------------------------------------ */
  /* Link Interception                                                  */
  /* ------------------------------------------------------------------ */

  addEventListener('click', (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) return;

    const a = e.target.closest('a');
    if (!a) return;
    if (a.target || a.hasAttribute('download') || a.host !== location.host) return;

    const href = a.getAttribute('href');
    if (!href || href[0] === '#') return;

    e.preventDefault();
    route(href, { source: 'link' });
  });

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */

  function subscribe(event) {
    return (cb) => {
      listeners[event].push(cb);
      return () => {
        listeners[event] = listeners[event].filter(x => x !== cb);
      };
    };
  }

  return {
    route,
    back,
    forward,

    onStart: subscribe('onStart'),
    onBefore: subscribe('onBefore'),
    onReady: subscribe('onReady'),
    onAfter: subscribe('onAfter'),
    onError: subscribe('onError'),
    onCancel: subscribe('onCancel'),

    performTransition(cb) {
      if (transitionHandler) {
        throw new Error('performTransition can only be set once');
      }
      transitionHandler = cb;
    }
  };
}
