const fs = require('fs')
const path = require('path')
const { runTransformers } = require('./common')

// A transformator is a function that takes the user-input CLI args, and mutates a file content string
const transformers = {
  // 'package.json': function (cliArgs, prevFileContent) {
  //   const prevO = JSON.parse(prevFileContent)
  //   const o = {
  //     ...prevO,
  //     scripts: { // TODO amazon only supports nodejs.10, 12, others 8 and 10, ...
  //       ...prevO.scripts,
  //       create: `zip -r deploypackage.zip * ; \
  //         aws lambda create-function \
  //          --function-name ${cliArgs['--name']} \
  //          --runtime ${cliArgs['--runtime']}.x \
  //          --handler _index.handler \
  //          --role ${cliArgs['--aws-role']} \
  //          --zip-file fileb://deploypackage.zip; \
  //          rm deploypackage.zip
  //          `,
  //       update: `zip -r deploypackage.zip * ; \
  //         aws lambda update-function-code \
  //          --function-name ${cliArgs['--name']} \
  //          --zip-file fileb://deploypackage.zip; \
  //          rm deploypackage.zip
  //         `
  //     }
  //   }
  //   return JSON.stringify(o, null, 2)
  // }
}

function transformAll (cliArgs) {
  return runTransformers(cliArgs, transformers)
}

module.exports = {
  transformAll
}
