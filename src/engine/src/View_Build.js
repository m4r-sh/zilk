import fs from 'fs'
import { Model } from 'zilk'

const transpiler = new Bun.Transpiler({
  loader: "js"
});

//can have multiple versions of this for different modes (dev vs prod vs tests)
let ViewFile = Model({
  module: {},  // updated by file watcher directly
  contents: '', // updated by file watcher directly
  get transpilation(){
    return transpiler.scan(this.contents)
  },
  get imported(){
    return this.transpilation.imports
  },
  get css(){
    return this.module.style()
  },
  get async_handler(){
    this.module.handlers; // read module.handlers to only re-compile when handlers changes
    return compile(`import { handlers } from '@'; export default handlers;`, {
      '@': this.filepath
    })
  }
})

let Aggregate = List(ViewFile)

let Simples = Aggregate.filter(({ num_imports }) => num_imports == 1)

Aggregate.$(arr => {
  // generate aggregate css stylesheet
})

Simples.$(arr => {
  // generate SSR saturation for simple elements
})

async function eachFile(file){
  let [mod, str] = await Promise.all([import(file),fs.readFile(file)])
  let result = transpiler.scan(str)
  console.log(result)
  console.log('Module keys' + Object.keys(mod))

  // for each file, do some number of calculations (imports, exports, total size, linting)
  // for each file, write some number of derivative files (saturation snippet, )
}

async function build({
  input_dir='./views',
  output_dir = './public/views',
}={}){
  let files = getFiles(input_dir).filter(s => s.endsWith('.js'))
  let modules_dict = {}
  for(let file of files){
    // TODO: check if this works with bun --watch. prob better to implement directly for perf
    let mod = await import(file)
    // TODO: might be better to do things using sync all around
    let str = await fs.readFile(file)
    let result = transpiler.scan(str)
    console.log(result)
    console.log('Module keys' + Object.keys(mod))
    modules_dict[file] = { mod, str }
    // TODO: add optional linting / sanity checks for dev mode
    // TODO: add analytics for handlers / render / style impact
  }
  // create aggregate stylesheet
  // create manifest for async, client-side imports (for saturation and/or renders)
  // create sync, all-in-one script that defines every minor cbomponent and async defines every "extra" component
  // create system to handle npm / caching / upgrading etc
  // create chunks that are easy to add when SSR rendering pages for insta-saturation

  // important to make this build process flexible - 
  // good metrics like imports / size / loading concerns can be automated
  // and recommendations to configure granular build strategies
  // maybe 80% of UI can be reactive on first render - and 20% that have big imports or complexity can be quickly downloaded async, but CLI also recommends adding a `loading` export to the file that serves an alternate HTML before the component can be rendered correctly
  // owning the entire dev experience without worrying about broad adoption is important for true productivity gains
  await Bun.build({
    entrypoints: [p],
    outdir: './public/views',
  })
}

function getFiles(dir,files=[]){
  for(let file of fs.readdirSync(dir)){
    let p = `${dir}/${file}`
    if(fs.statSync(p).isDirectory()){
      getFiles(p,files) //recursive
    } else {
      files.push(p)
    }
  }
  return files
}