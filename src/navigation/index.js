import { parseQuery, patternToRegex, routeEntries } from '../nav/utils.js';

const MAX_REDIRECT_DEPTH = 8;

export function createRouter({
  pull = 'pull',
  pages = {},
  redirects = {},
  transition,
  notFound
} = {}) {
  if (typeof transition !== 'function') {
    throw new TypeError('createRouter requires a transition function');
  }
  if (!globalThis.navigation) {
    throw new Error('The Navigation API is not available in this browser');
  }

  const pageRoutes = compileRoutes(pages);
  const redirectRoutes = compileRoutes(redirects);

  async function render(mod, url, params, event) {
    const req = {
      params,
      query: parseQuery(url),
      signal: event.signal,
      url
    };

    if (mod[pull]) req.pull = await mod[pull](req);
    const [meta, content] = await Promise.all([
      mod.meta(req),
      mod.content(req)
    ]);

    await transition({ meta, content, req, event });
  }

  function handleNavigate(event) {
    if (
      !event.canIntercept ||
      event.hashChange ||
      event.downloadRequest ||
      event.formData
    ) return;

    const destination = new URL(event.destination.url);
    if (destination.origin !== location.origin) return;

    let redirected;
    try {
      redirected = resolveRedirects(destination, redirectRoutes);
    } catch (error) {
      event.intercept(event.cancelable
        ? { precommitHandler() { throw error; } }
        : { handler() { throw error; } }
      );
      return;
    }

    const route = matchRoute(redirected.url.pathname, pageRoutes);
    const mod = route?.value || notFound;
    if (!mod) return;

    const handler = () => render(mod, redirected.url, route?.params || {}, event);

    if (!redirected.count) {
      event.intercept({ handler });
      return;
    }

    if (!event.cancelable) {
      event.intercept({
        handler() {
          queueMicrotask(() => {
            navigation.navigate(redirected.url.href, { history: 'replace' });
          });
        }
      });
      return;
    }

    event.intercept({
      precommitHandler(controller) {
        controller.redirect(redirected.url.href, {
          history: event.navigationType === 'push' ? 'push' : 'replace'
        });
        controller.addHandler(handler);
      }
    });
  }

  navigation.addEventListener('navigate', handleNavigate);
  return () => navigation.removeEventListener('navigate', handleNavigate);
}

function compileRoutes(routes) {
  return routeEntries(routes).map(([pattern, value]) => ({
    regex: patternToRegex(pattern),
    value
  }));
}

function matchRoute(path, routes) {
  const cleanPath = path.replace(/\/+$/, '') || '/';

  for (const { regex, value } of routes) {
    const match = cleanPath.match(regex);
    if (match) return { value, params: match.groups || {} };
  }

  return null;
}

function resolveRedirects(destination, routes) {
  let url = destination;
  let count = 0;

  while (true) {
    const redirect = matchRoute(url.pathname, routes);
    if (!redirect) return { url, count };
    if (count >= MAX_REDIRECT_DEPTH) {
      throw new Error(`Redirect depth exceeded (${MAX_REDIRECT_DEPTH}) at ${url.pathname}`);
    }

    const values = Object.values(redirect.params);
    const path = redirect.value.replace(/\$(\d+)/g, (_, number) => {
      return values[Number(number) - 1] || '';
    });

    url = new URL(path, url.origin);
    count++;
  }
}
