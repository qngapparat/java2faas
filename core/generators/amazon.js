const {
  runGenerators,
  getBuildPath,
  getPackageName
} = require('./common')
const path = require('path')

// A generator is a function that takes the user-input CLI args and produces some source code

// TODO nice colored terminal log msgs (separate module)

// TODO global: path join => resolve
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO improve this (??)
    const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const reqClassName = cliArgs['--request-file']
      ? cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
      : 'Request' // default
    const resClassName = cliArgs['--response-file']
      ? cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]
      : 'Response' // default

    // usually src/main/java
    const buildPath = getBuildPath(cliArgs)
    // compute 'package ... ' java codeline
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

  'deploy.sh': function (cliArgs) {
    return {
      code: `
#!/bin/bash
mvn package
cd target
aws lambda create-function --function-name ${cliArgs['--name']} --handler ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry::handleRequest --zip-file fileb://my-lambda-1.0.jar --runtime java8 --role ${cliArgs['--aws-role']}
      `,
      path: 'deploy.sh'
    }
  },

  'update.sh': function (cliArgs) {
    return {
      code: `
#!/bin/bash
mvn package
cd target
aws lambda update-function-code --function-name ${cliArgs['--name']} --zip-file fileb://my-lambda-1.0.jar3
      `,
      path: 'update.sh'
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
