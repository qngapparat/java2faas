const {
  runGenerators,
  getBuildPath,
  getPackageName
} = require('./common')
const path = require('path')

// TODO ?? put gens in separate files

// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  'Entry.java': function (cliArgs) {
    // // TODO improve this
    const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const reqClassName = cliArgs['--request-file']
      ? cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
      : 'Request' // default
    const resClassName = cliArgs['--response-file']
      ? cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]
      : 'Response' // default

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

  // TODO proper help + script usage
  'deploy.sh': function (cliArgs) {
    return {
      code: `
      #ibmcloud login -u "$parameteru" -p "$parameterp" -g "$parameterR"
      #ibmcloud target -r "$parameterr"
      #ibmcloud target -o "$parametero" -s "$parameters"
      mvn package
      cd target
      ibmcloud fn action create ${cliArgs['--name']} my-lambda-1.0.jar --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
      `,
      path: 'deploy.sh'
    }
  },
  // TODO note that new regions will need a org, space otherwise deploy fails
  'update.sh': function (cliArgs) {
    return {
      code: `
      mvn package
      cd target
      ibmcloud fn action update ${cliArgs['--name']} my-lambda-1.0.jar --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
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
