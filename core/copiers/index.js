const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
/**
 *
 * @param {string} srcDir
 * @param {string} destDir
 * @param {string[]} [except] File/folder names to not copy
 */
function copy (srcDir, destDir, except = []) {
  if (fs.existsSync(srcDir) === false) throw new Error(`Cannot copy. Source dir ${srcDir} does not exist`)
  if (fs.existsSync(destDir) === false) throw new Error(`Cannot copy. Dest dir ${destDir} does not exist`)
  // cannot copy destdir into itself
  except = [...except, destDir]
  // All filenames \ { except }
  const fns = fs.readdirSync(srcDir)
    .filter(fn => except.includes(fn) === false)

  fns.forEach(fn => {
    fse.copySync(path.join(srcDir, fn), path.join(destDir, fn)) // TODO do async, faster for large file projs
  })
}

module.exports = {
  copy
}
