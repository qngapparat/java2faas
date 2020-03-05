const path = require('path')
const fs = require('fs')

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
  const packageName = getPackageName(cliArgs)

  if (packageName) {
    buildPath = path.join(
      ...cliArgs['--entry-file']
        .split(path.sep)
        .slice(0, -1) // remove 'Hello.java'
        .join('.')
        .replace(packageName, '') // remove 'com.example'
        .split('.')
        .filter(dir => dir != null && dir.trim() !== '')
    )
    console.log(`Computed Java build path: ${buildPath}`)
    return buildPath
  } else {
    // user uses default package
    // => just place Entry.java in same flat directory with all the other .java files
    buildPath = path.join(...cliArgs['--entry-file'].split(path.sep).slice(0, -1))
    return buildPath
  }
}

module.exports = {
  runGenerators,
  getBuildPath,
  getPackageName
}
