const {
  runGenerators,
  getBuildPath,
  getPackageName
} = require('./common')
const path = require('path')
const fs = require('fs')

// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO write import fields if specified entry point is in another package

    // // TODO better name for entry-file
    // // TODO improve this
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
import com.google.gson.JsonObject;
import com.google.gson.Gson;
public class Entry {
  public static JsonObject main(JsonObject event) {
  String eventStr = event.toString();
  ${reqClassName} eventObj = new Gson().fromJson(eventStr, ${reqClassName}.class);
  ${className} instance = new ${className}();
  ${resClassName} res = instance.${cliArgs['--entry-method']}(eventObj);

  String resString = new Gson().toJson(res, ${resClassName}.class);
  JsonObject resJsonObj = new Gson().fromJson(resString, JsonObject.class);
  
  return resJsonObj;
  // TODO serialize using response class
  }
}
    `,
      // where that above should be written to  (relative to project root)     // MUST correspond
      path: path.join(buildPath, 'Entry.java')
    }
  },

  // TODO we DO wanna overwrite here
  'deploy.sh': function (cliArgs) {
    return {
      code: `
gradle jar
cd ${path.join('build', 'libs')}
 # TODO improve this
ibmcloud fn action create ${cliArgs['--name']} $(ls | grep ibm | head -n 1) --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
      `,
      path: path.join(cliArgs['--path'], 'deploy.sh')
    }
  },

  'update.sh': function (cliArgs) {
    return {
      code: `
gradle jar
cd ${path.join('build', 'libs')}
ibmcloud fn action update ${cliArgs['--name']} $(ls | grep ibm | head -n 1) --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
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
