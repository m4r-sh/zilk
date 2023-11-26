build()

async function build(){
  let uhtml_ssr = await get_uhtml_ssr()
  await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './build',
    minify: false
  })
  await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './build/ssr',
    minify: false,
    plugins: [
      {
        name: 'uhtml-ssr',
        setup(build){
          build.onResolve({ filter: /^(uhtml)$/},({ path }) => ({
            path: 'uhtml',
            namespace: 'virtual'
          }))
          build.onLoad({ filter: /^(uhtml)$/, namespace: 'virtual'  },({ path }) => ({ 
            loader: 'js',
            contents: uhtml_ssr
          }))
        }
      }
    ]
  })
}

async function get_uhtml_ssr(){
  let ssr_script = await Bun.build({
    entrypoints: [Bun.resolveSync('uhtml-ssr','.')],
    minify: false
  })
  return await ssr_script.outputs[0].text()
}