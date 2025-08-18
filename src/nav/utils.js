// pathMatcher.js

// Convert itty-router style pattern to regex
export function patternToRegex(pattern) {
  return RegExp(
    '^' +
    (('/' + pattern).replace(/\/+(\/|$)/g, '$1'))
      .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>.*))')  // Greedy params
      .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // Named params
      .replace(/\./g, '\\.')                          // Escape dots
      .replace(/(\/?)\*/g, '($1.*)?')                 // Wildcard
    + '/*$'
  );
}

// Match a path against patterns and redirects
export function matchPath(path, pages = {}, redirects = {}) {
  const cleanPath = path.replace(/\/+$/, '') || '/';

  // Check redirects first
  if (redirects[cleanPath]) {
    return { redirect: redirects[cleanPath] };
  }

  // Match against page routes
  for (const [pattern, handler] of Object.entries(pages)) {
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