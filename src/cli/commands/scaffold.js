// generate files & folders based on quick questions in CLI

export let scaffold = function*(){

}

let scaffold_project = () => {
  // create views/models/routes folders & basic zilk.config
  // 
}

let scaffold_view = ({
  output_dir: '',
  name: 'Button',
  has_style: true,
  has_handlers: true,
}={}) => {
  // check for matching name in output dir
  return `
import { html, css, classify } from 'zilk';

let { BUTTON } = classify('Button')

export default () => html\`
  // render goes here
\`

export let style = () => css\`
  
\`

export let handlers = {
  [BUTTON]: {
    
  }
}
  `
}

let scaffold_model = ({

}) => {
  return `
import { Model } from 'zilk';

export default Model({

})
  `
}