
const path = require('path')
const fs = require('fs')

/**
 *
 * @param {{*}} cliArgs
 * @param {{*}} transformersObj An object with keys: fns, values: { code: ..., path: ...} (path is relative to proj root and includes fn)
 */
function runTransformers (cliArgs, transformersObj) {

  ///   for [ 'File.java', () =]
  // TODO transformersObj would need to expose a sourcepath per fn (before transformer is invoked)

  // const prevFileContents = fnsObjs.map(fnObj => fs.readFileSync(path.join(cliArgs['--path'], fnObj.path)))
  // const prevFileContents = fns.map(fn => fs.readFileSync(path.join(cliArgs['--path'], fn), { encoding: 'utf-8' }))
  // const newFileContents = fns.map((fn, idx) => (transformersObj[fn])(cliArgs, prevFileContents[idx]))

  // return fns.map((fn, idx) => ({ fn: fn, content: newFileContents[idx] }))
}

// function runGenerators (cliArgs, generatorsObj) {
//   const fns = Object.keys(generatorsObj) // array
//   const contentsAndPaths = fns.map(fn => (generatorsObj[fn])(cliArgs)) // [{ code:string, path:string}]
//   return fns.map((fn, idx) => (
//     {
//       content: contentsAndPaths[idx].code,
//       path: contentsAndPaths[idx].path // ie. 'build.gradle' or 'src/main/java/Hello.java'
//     }
//   ))
// }

module.exports = {
  runTransformers
}
