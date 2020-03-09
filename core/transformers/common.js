// TODO add bash shebang

const path = require('path')
const fs = require('fs')

/**
 * @param {{*}} cliArgs
 * @param {{*}} transformersObj An object with keys: fns, values: { code: ..., path: ...} (path is relative to proj root and includes fn)
 */
function runTransformers (cliArgs, transformersObj) {
  const fns = Object.keys(transformersObj)
  // Read file contents (fall back on empty string)
  const prevFileContents = fns.map(fn => {
    try {
      return fs.readFileSync(path.join(cliArgs['--path'], fn), { encoding: 'utf8' })
    } catch (e) {
      return ''
    }
  })
  const newContentsAndPaths = fns.map((fn, idx) => (transformersObj[fn])(cliArgs, prevFileContents[idx]))
  return newContentsAndPaths
}

module.exports = {
  runTransformers
}
