const segmentRank = (segment) => {
  if (segment === '*' || /^:\w+\+$/.test(segment)) return 2;
  if (segment.startsWith(':')) return 1;
  return 0;
};

// Return page routes in matching order without changing the input object.
export function routeEntries(routes = {}) {
  return Object.entries(routes)
    .map((entry, index) => ({ entry, index, segments: entry[0].split('/').filter(Boolean) }))
    .sort((a, b) => {
      const length = Math.min(a.segments.length, b.segments.length);

      for (let i = 0; i < length; i++) {
        const difference = segmentRank(a.segments[i]) - segmentRank(b.segments[i]);
        if (difference) return difference;
      }

      return a.segments.length - b.segments.length || a.index - b.index;
    })
    .map(({ entry }) => entry);
}

// Convert itty-router style pattern to regex
export function patternToRegex(pattern) {
  const expressions = [];
  const expression = (source) => `__ZILK_EXPR_${expressions.push(source) - 1}__`;
  const escape = (source) => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let source = ('/' + pattern).replace(/\/+(\/|$)/g, '$1')
    .replace(/(\/?\.?):(\w+)\+/g, (_, prefix, name) => {
      return expression(`(${escape(prefix)}(?<${name}>.*))`);
    })
    .replace(/(\/?\.?):(\w+)/g, (_, prefix, name) => {
      return expression(`(${escape(prefix)}(?<${name}>[^/]+?))`);
    })
    .replace(/(\/?)\*/g, (_, prefix) => {
      return expression(`(${escape(prefix)}.*)?`);
    });

  source = escape(source).replace(/__ZILK_EXPR_(\d+)__/g, (_, index) => expressions[index]);
  return RegExp(`^${source}/*$`);
}

// Match a path against patterns and redirects
export function matchPath(path, pages = {}, redirects = {}) {
  const cleanPath = path.replace(/\/+$/, '') || '/';

  // Check redirects first
  if (redirects[cleanPath]) {
    return { redirect: redirects[cleanPath] };
  }

  // Match against page routes
  for (const [pattern, handler] of routeEntries(pages)) {
    const regex = patternToRegex(pattern);
    const match = cleanPath.match(regex);
    if (match) {
      const params = match.groups || {};
      return { handler, params };
    }
  }

  return null;
}

// Parse query parameters from URL
export function parseQuery(url) {
  const { searchParams } = new URL(url, location?.origin || 'http://localhost');
  const query = {};
  for (let [k, v] of searchParams) {
    query[k] = query[k] ? [].concat(query[k], v) : v;
  }
  return query;
}
