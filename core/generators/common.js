/**
 * Run every gen in genereatorsObj with given cliArgs, return their output as array
 * @returns {[{content, path}]} Array of { fn: ..., content: ... }
 */

// TODO adopt to new { code: ..., path: ...} schema
function runGenerators (cliArgs, generatorsObj) {
  const fns = Object.keys(generatorsObj) // array
  const contentsAndPaths = fns.map(fn => (generatorsObj[fn])(cliArgs)) // [{ code:string, path:string}]
  return fns.map((fn, idx) => (
    {
      content: contentsAndPaths[idx].code,
      path: contentsAndPaths[idx].path // ie. 'build.gradle' or 'src/main/java/Hello.java'
    }
  ))
}

module.exports = {
  runGenerators
}
