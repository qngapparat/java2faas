const {
  runGenerators,
  getBuildPath,
  getPackageName
} = require('./common')
const path = require('path')
const fs = require('fs')
// A generator is a function that takes the user-input CLI args and produces some source code

// TODO global: path join => resolve
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO improve this (??)
    const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const reqClassName = cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const resClassName = cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]

    // usually src/main/java
    const buildPath = getBuildPath(cliArgs)
    // compute 'package ... ' codeline
    const packageName = getPackageName(cliArgs)
    let packageCodeLine = ''
    if (packageName) {
      packageCodeLine = `package ${packageName};\n`
    }

    return {
      code: `
${packageCodeLine}
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.Context;

public class Entry implements RequestHandler<${reqClassName}, ${resClassName}> {

  public ${resClassName} handleRequest(${reqClassName} event, Context context) {
    ${className} instance = new ${className}();
    ${resClassName} res = instance.${cliArgs['--entry-method']}(event);
    return res;
  }
}
    `,

      path: path.join(buildPath, 'Entry.java')
    }
  },

  // TODO region flag

  'deploy.sh': function (cliArgs) {
    return {
      code: `
gradle build
cd ${path.join('build', 'distributions')}
aws lambda create-function --function-name ${cliArgs['--name']} --handler ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry::handleRequest --zip-file fileb://amazon.zip --runtime java8 --role ${cliArgs['--aws-role']}
      `,
      path: path.join(cliArgs['--path'], 'deploy.sh')
    }
  },

  'update.sh': function (cliArgs) {
    return {
      code: `
gradle build
cd ${path.join('build', 'distributions')}
aws lambda update-function-code --function-name ${cliArgs['--name']} --zip-file fileb://amazon.zip 
      `,
      path: path.join(cliArgs['--path'], 'update.sh')
    }
  }
}
/**
 *
 * @returns {[{code, path}]}
 */
function generateAll (cliArgs) {
  return runGenerators(cliArgs, generators)
}

module.exports = {
  generateAll
}
