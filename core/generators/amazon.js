const { runGenerators } = require('./common')
const path = require('path')
const fs = require('fs')
// A generator is a function that takes the user-input CLI args and produces some source code

// TODO global: path join => resolve
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO write import fields if specified entry point is in another package
    // TODO improve this (??)
    const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const reqClassName = cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const resClassName = cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]
    // Get the java package name of the user's entry file
    // fallback: ''
    let packageCodeLine = fs.readFileSync(path.resolve(cliArgs['--path'], cliArgs['--entry-file']), { encoding: 'utf8' })
      .match(/package [^;]*;/)

    let buildPath
    // compute path to save this file to
    // (usually it's 'src/main/java')
    if (packageCodeLine) {
      packageCodeLine = packageCodeLine[0]
      const packageName = packageCodeLine
        .replace('package', '')
        .replace(';', '')
        .trim()
      // eg. [..., 'src', 'main', 'java', 'com', 'example', 'Hello.java']
      buildPath = path.join(
        ...cliArgs['--entry-file']
          .split(path.sep)
          .slice(0, -1) // remove 'Hello.java'
          .join('.')
          .replace(packageName, '') // remove 'com.example'
          .split('.')
          .filter(dir => dir != null && dir.trim() !== ''),
        'Entry.java'
      )

      console.log(`Computed Java build path: ${buildPath}`)
    } else {
      // user uses default package
      // => just place Entry.java in same flat directory with all the other .java files
      buildPath = path.join(...cliArgs['--entry-file'].split(path.sep).slice(0, -1), 'Entry.java')
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

      // TODO this isnt always the path we want to put entry.java ito
      //
      path: buildPath
    }
  },

  // TODO region flag

  'deploy.sh': function (cliArgs) {
    return {
      code: `
gradle build
cd ${path.join('build', 'distributions')}
aws lambda create-function --function-name ${cliArgs['--name']} --handler Entry::handleRequest --zip-file fileb://amazon.zip --runtime java8 --role ${cliArgs['--aws-role']}
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
