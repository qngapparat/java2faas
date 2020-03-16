const path = require('path')
const fs = require('fs')

// TODO allow omitting -request/response fpath if user names then Request/Response.

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

/**
* @description Returns the java package name of the user's entryfile
* @param {*} cliArgs
  @returns {string}
 */
function getPackageName (cliArgs) {
  let packageCodeLine = fs.readFileSync(path.resolve(cliArgs['--path'], cliArgs['--entry-file']), { encoding: 'utf8' })
    .match(/package [^;]*;/)
  if (packageCodeLine) {
    packageCodeLine = packageCodeLine[0]
    //    'package com.example;'
    // => 'com.example'
    return packageCodeLine
      .replace('package', '')
      .replace(';', '')
      .trim()
  } else {
    return ''
  }
}

/**
 * @description Returns the root build path (usually 'src/main/java')
 * @param {*} cliArgs
 * @returns {string}
 */
function getBuildPath (cliArgs) {
  let buildPath
  // const packageName = getPackageName(cliArgs)

  // TODO Assumes entry-file is directly in buildPath (not in some nested folder)
  // TODO always the case??

  // TODO does this work with packages still??

  buildPath = path.join(
    ...path.relative(
      cliArgs['--path'],
      cliArgs['--entry-file']
    )
      .split(path.sep)
      .slice(0, -1) // remove 'Hello.java' (or similar)
  )
  console.log('COMPUTED:', buildPath, '\n\n\n')
  process.stdout.write(`Computed Java build path: ${buildPath}`)
  return buildPath
}

module.exports = {
  runGenerators,
  getBuildPath,
  getPackageName
}
