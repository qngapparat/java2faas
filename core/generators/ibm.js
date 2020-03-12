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

  // TODO proper help + script usage
  'deploy.sh': function (cliArgs) {
    return {
      code: `
#!/bin/bash

##############################################
# Bash argument parser 
# Courtesy Rafael Muynarsk / Stackoverflow 
##############################################
helpFunction()
{
  echo ""
  echo "Usage: $0 -a parameterA -b parameterB -c parameterC"
  echo ""
  echo "a Description of what is parameterA"
  echo "b Description of what is parameterB"
  echo "c Description of what is parameterC"
  exit 1 # Exit script after printing help
}

while getopts "r:R:u:p:o:s:" opt
do
case "$opt" in
r ) parameterr="$OPTARG" ;;
R ) parameterR="$OPTARG" ;;
u ) parameteru="$OPTARG" ;;
p ) parameterp="$OPTARG" ;;
o ) parametero="$OPTARG" ;;
s ) parameters="$OPTARG" ;;
? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
esac
done

# Print helpFunction in case parameters are empty
if [ -z "$parameterr" ] || [ -z "$parameterR" ] || [ -z "$parameteru" ] || [ -z "$parameterp" ] || [ -z "$parametero" ] || [ -z "$parameters" ]
then
echo "Some or all of the parameters are empty";
helpFunction
fi

# Begin script in case all parameters are correct

gradle jar || exit 1

ibmcloud login -u "$parameteru" -p "$parameterp" -g "$parameterR"
ibmcloud target -r "$parameterr"
ibmcloud target -o "$parametero" -s "$parameters"

cd ${path.join('build', 'libs')}
ibmcloud fn action create ${cliArgs['--name']} ibm.jar --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
`,
      path: path.join(cliArgs['--path'], 'deploy.sh')
    }
  },

  'update.sh': function (cliArgs) {
    return {
      code: `
#!/bin/bash

##############################################
# Bash argument parser 
# Courtesy Rafael Muynarsk / Stackoverflow 
##############################################
helpFunction()
{
  echo ""
  echo "Usage: $0 -a parameterA -b parameterB -c parameterC"
  echo ""
  echo "a Description of what is parameterA"
  echo "b Description of what is parameterB"
  echo "c Description of what is parameterC"
  exit 1 # Exit script after printing help
}

while getopts "r:R:u:p:o:s:" opt
do
case "$opt" in
r ) parameterr="$OPTARG" ;;
R ) parameterR="$OPTARG" ;;
u ) parameteru="$OPTARG" ;;
p ) parameterp="$OPTARG" ;;
o ) parametero="$OPTARG" ;;
s ) parameters="$OPTARG" ;;
? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
esac
done

# Print helpFunction in case parameters are empty
if [ -z "$parameterr" ] || [ -z "$parameterR" ] || [ -z "$parameteru" ] || [ -z "$parameterp" ] || [ -z "$parametero" ] || [ -z "$parameters" ]
then
echo "Some or all of the parameters are empty";
helpFunction
fi

# Begin script in case all parameters are correct

gradle jar || exit 1

ibmcloud login -u "$parameteru" -p "$parameterp" -g "$parameterR"
ibmcloud target -r "$parameterr"
ibmcloud target -o "$parametero" -s "$parameters"

cd ${path.join('build', 'libs')}
ibmcloud fn action update ${cliArgs['--name']} ibm.jar --kind java:8 --main ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry
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
