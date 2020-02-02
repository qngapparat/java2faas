/**
 * Run every gen in genereatorsObj with given cliArgs, return their output as array
 * @returns {[{fn, content}]} Array of { fn: ..., content: ... }
 */
function runGenerators (cliArgs, generatorsObj) {
  const fns = Object.keys(generatorsObj) // array
  const contents = fns.map(fn => (generatorsObj[fn])(cliArgs)) // array
  return fns.map((fn, idx) => ({ fn: fn, content: contents[idx] }))
}

module.exports = {
  runGenerators
}
