const fs = require('fs')
const path = require('path')
const { runGenerators } = require('./common')

// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  '_index.js': function (cliArgs) {
    return `
    exports.handler = function runUserFunc(first, second, third, fourth) {
                              
      const userFunc = require('./${cliArgs['--entry-file']}')
       // run user function with 'event'
      return userFunc(first)
    }
  `
  }
}

/**
 *
 * @returns {[{fn, content}]} Array of { fn: ..., content: ... }
 */
function generateAll (cliArgs) {
  return runGenerators(cliArgs, generators)
}

module.exports = {
  generateAll
}
