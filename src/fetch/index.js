import { AutoRouter, html } from 'itty-router'
import { render } from '../ssr.js'
import { patternToRegex, routeEntries } from '../nav/utils.js';

export function createHandler({
  pull = 'pull',
  routes = {},
  pages = {},
  redirects = {},
  template,
} = {}){
  const router = AutoRouter()

  const routeHandler = value => {
    if (typeof value === 'function') return value
    if (value instanceof Response) return () => value.clone()
    throw new TypeError('A route handler must be a function or Response')
  }

  for (const [pattern, value] of Object.entries(routes)) {
    if (typeof value === 'function' || value instanceof Response) {
      router.all(pattern, routeHandler(value))
      continue
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('A route must be a handler, Response, or method object')
    }
    for (const [method, handler] of Object.entries(value)) {
      router[method.toLowerCase()](pattern, routeHandler(handler))
    }
  }

  async function writeHTML(mod,req){
    if(mod[pull]){ req.pull = await mod[pull](req) }
    let [meta, content] = await Promise.all([mod.meta(req),mod.content(req)])
    let html_str = render(String,template({ meta, content }))
    return html(html_str)
  }

  router.all('*', (req) => {
    const url = new URL(req.url)
    for (const [pattern, destination] of Object.entries(redirects)) {
      const regex = patternToRegex(pattern)
      const match = url.pathname.match(regex)
      if (match) {
        let redirectPath = destination
        if (match.groups) {
          redirectPath = destination.replace(/\$(\d+)/g, (_, num) => {
            return Object.values(match.groups)[parseInt(num) - 1] || ''
          })
        }
        return Response.redirect(new URL(redirectPath, url.origin).toString(), 301)
      }
    }
  })
  
  routeEntries(pages).forEach(([pattern,mod]) => {
    router.get(pattern,(req) => writeHTML(mod,req))
  })
  
  return router.fetch

}
