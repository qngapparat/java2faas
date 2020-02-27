const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { copy } = require('./copiers')

const generateIbmCode = require('./generators/ibm').generateAll
const transformIbmCode = require('./transformers/ibm').transformAll
/**
 *
 * Transpiles the user code to ibm/
 * @param {*} cliArgs
 */
function ibm (cliArgs) {
  fs.mkdirSync(path.join(cliArgs['--path'], 'ibm'))

  // copy user's files into ibm/
  copy(
    cliArgs['--path'],
    path.join(cliArgs['--path'], 'ibm'),
    ['amazon', 'ibm', 'google', '.git', '.github', 'build']
  )

  // write generated files to ibm/...packagepath/

  // eg. src/main/java/Hello.java
  // OR  src.main.java.Hello
  // const splitEntryPath = cliArgs['--entry-file'].split(path.sep)
  // const codeDir = path.join(cliArgs['--path'], 'ibm', ...splitEntryPath.slice(0, -1))

  // write generated files

  const generated = generateIbmCode(cliArgs)
  generated.forEach(g => fs.writeFileSync(path.join(cliArgs['--path'], 'ibm', g.path), g.content))

  // write transfored files
  const transformed = transformIbmCode(cliArgs)
  transformed.forEach(t => fs.writeFileSync(path.join(cliArgs['--path'], 'ibm', t.path), t.content))
}

module.exports = ibm
