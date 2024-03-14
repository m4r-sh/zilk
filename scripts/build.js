build()

async function build(){
  let res
  // HYDRATION
  res = await Bun.build({
    entrypoints: ['./src/hydrate/index.js'],
    outdir: './dist/hydrate',
    target: 'browser',
    minify: false
  })
  if(!res.success) console.log(res)
  // ROUTER
  res = await Bun.build({
    entrypoints: ['./src/router/index.js'],
    outdir: './dist/router',
    target: 'browser',
    minify: false
  })
  if(!res.success) console.log(res)
  // MAIN (BROWSER)
  res = await Bun.build({
    entrypoints: ['./src/browser.js'],
    outdir: './dist',
    target: 'browser',
    naming: '[dir]/index.[ext]',
    minify: false
  })
  if(!res.success) console.log(res)
  res = await Bun.build({
    entrypoints: ['./src/browser.js'],
    outdir: './dist',
    target: 'browser',
    naming: '[dir]/index.min.[ext]',
    minify: true
  })
  if(!res.success) console.log(res)
  // MAIN (SERVER)
  res = await Bun.build({
    entrypoints: ['./src/server.js'],
    outdir: './dist/ssr',
    target: 'node',
    naming: '[dir]/node.[ext]',
    minify: false
  })
  if(!res.success) console.log(res)
  res = await Bun.build({
    entrypoints: ['./src/server.js'],
    outdir: './dist/ssr',
    target: 'bun',
    naming: '[dir]/bun.[ext]',
    minify: false
  })
  if(!res.success) console.log(res)
}

// async function get_uhtml_ssr(){
//   let ssr_script = await Bun.build({
//     entrypoints: [Bun.resolveSync('uhtml-ssr','.')],
//     minify: false
//   })
//   return await ssr_script.outputs[0].text()
// }