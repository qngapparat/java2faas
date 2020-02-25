const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { copy } = require('./copiers')

const generateAmazonCode = require('./generators/amazon').generateAll
const transformAmazonCode = require('./transformers/amazon').transformAll
/**
 *
 * Transpiles the user code to amazon/
 * @param {*} cliArgs
 */
function amazon (cliArgs) {
  fs.mkdirSync(path.join(cliArgs['--path'], 'amazon'))

  // copy user's files into amazon/
  copy(
    cliArgs['--path'],
    path.join(cliArgs['--path'], 'amazon'),
    ['amazon', 'ibm', 'google', '.git', '.github', 'build']
  )

  // write generated files to amazon/...packagepath/

  // eg. src/main/java/Hello.java
  // OR  src.main.java.Hello
  // const splitEntryPath = cliArgs['--entry-file'].split(path.sep)
  // const codeDir = path.join(cliArgs['--path'], 'amazon', ...splitEntryPath.slice(0, -1))

  // write generated files

  const generated = generateAmazonCode(cliArgs)
  generated.forEach(g => fs.writeFileSync(path.join(cliArgs['--path'], 'amazon', g.path), g.content))

  // write transfored files
  // TODO first also adopt { content: ... path: ...}
  // TODO then rewrite & uncomment this

  // const transformed = transformAmazonCode(cliArgs)
  // transformed.forEach(t => fs.writeFileSync(path.join(codeDir, t.fn), t.content))
}

module.exports = amazon
