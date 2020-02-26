const fs = require('fs')
const path = require('path')
const { runTransformers } = require('./common')

// A transformator is a function that takes the user-input CLI args, and mutates a file content string
// TODO convert this to { code: ..., path: ...}

const transformers = {
  // '_UserEntryFile': function(cliArgs) {
  //                       // account for second path being absolute or relative
  //   const fPath = path.resolve(cliArgs['--path'], cliArgs['--entry-file'])
  //   const fileContent = fs.readFileSync(fPath, { encoding: 'utf-8'})

  //   let res = { 
  //     code: fileContent,
  //     path: path.resolve(cliArgs['--path'], cliArgs['--entry-file'])
  //   }

  //   // Ensure these two codelines are in there
  //   [
  //     ''
  //   ]
  // }
}

function transformAll (cliArgs) {
  return runTransformers(cliArgs, transformers)
}

module.exports = {
  transformAll
}
