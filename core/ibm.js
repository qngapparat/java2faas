const path = require('path')
const fs = require('fs')
const { copy } = require('./copiers')

const generateIbmCode = require('./generators/ibm').generateAll
const transformIbmCode = require('./transformers/ibm').transformAll
/**
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

  // write generated files

  const generated = generateIbmCode(cliArgs)
  generated.forEach(g => fs.writeFileSync(path.join(cliArgs['--path'], 'ibm', g.path), g.code))

  // write transformed files
  const transformed = transformIbmCode(cliArgs)
  transformed.forEach(t => fs.writeFileSync(path.join(cliArgs['--path'], 'ibm', t.path), t.code))
}

module.exports = { ibm }
