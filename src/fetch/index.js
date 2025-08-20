import { AutoRouter, html } from 'itty-router'
import { render } from '../ssr.js'
import { patternToRegex, matchPath, parseQuery } from '../nav/utils.js';

export function createHandler({ pull, pages, redirects, template }){
  const router = AutoRouter()
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
  
  Object.entries(pages).forEach(([pattern,mod]) => {
    router.get(pattern,(req) => writeHTML(mod,req))
  })
  
  return router.fetch

}