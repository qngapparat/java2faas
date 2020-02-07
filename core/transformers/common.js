
const path = require('path')
const fs = require('fs')

/**
 *
 * @param {*} cliArgs
 * @returns {[{fn, content}]}
 *
 * // TODO convert this to code-path + fn-content-path schema
 */
function runTransformers (cliArgs, transformersObj) {
  const fns = Object.keys(transformersObj)
  const prevFileContents = fns.map(fn => fs.readFileSync(path.join(cliArgs['--path'], fn), { encoding: 'utf-8' }))
  const newFileContents = fns.map((fn, idx) => (transformersObj[fn])(cliArgs, prevFileContents[idx]))

  return fns.map((fn, idx) => ({ fn: fn, content: newFileContents[idx] }))
}

module.exports = {
  runTransformers
}
