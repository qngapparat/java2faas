/**
 * Run every gen in genereatorsObj with given cliArgs, return their output as array
 * @returns {[{code, path}]} Array of { fn: ..., code: ... }
 */

function runGenerators (cliArgs, generatorsObj) {
  const fns = Object.keys(generatorsObj) // array
  const contentsAndPaths = fns.map(fn => (generatorsObj[fn])(cliArgs)) // [{ code:string, path:string}]
  return fns.map((fn, idx) => (
    {
      code: contentsAndPaths[idx].code,
      path: contentsAndPaths[idx].path
    }
  ))
}

module.exports = {
  runGenerators
}
