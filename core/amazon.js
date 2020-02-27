const path = require('path')
const fs = require('fs')
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

  // write generated files

  const generated = generateAmazonCode(cliArgs)
  generated.forEach(g => fs.writeFileSync(path.join(cliArgs['--path'], 'amazon', g.path), g.content))
  // TODO RENAME CONTENT TO CODE (=>consistent)

  // write transformed files
  const transformed = transformAmazonCode(cliArgs)
  transformed.forEach(t => fs.writeFileSync(path.join(cliArgs['--path'], 'amazon', t.path), t.content))
}

module.exports = amazon
