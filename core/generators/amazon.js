const {
  runGenerators,
  getBuildPath,
  getPackageName
} = require('./common')
const path = require('path')
const fs = require('fs')
// TODO move more params from java2faas to deploy.sh (name, iam... ?)

// A generator is a function that takes the user-input CLI args and produces some source code

// TODO nice colored terminal log msgs (separate module)

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
  // TODO login (u, p)
  // TODO if no u,p specified still try
  // TODO shebang correct? really need bash (vs sh)
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

getCleanedArgs()
{
  IGNORENEXT=false
  SNIPPED=""
  for var in "$@"; do
      # - Ditch java2faas custom arguments AWS CLI should never see
      # - Pass through AWS CLI args
      if [ "$var" = '-u' ] || [ "$var" = '-p' ]
      then
        IGNORENEXT=true
        continue
      fi
  
      if [ "$IGNORENEXT" = true ]
      then 
        IGNORENEXT=false
        continue
      fi

      SNIPPED="$SNIPPED $var"
  done
  
  return "$SNIPPED"
}


while getopts "u::p::" opt
do
   case "$opt" in
      u ) parameteru="$OPTARG" ;;
      p ) parameterp="$OPTARG" ;;
      h ) helpFunction
   esac
done



gradle build
cd ${path.join('build', 'distributions')}

if [ -z "$parameteru" ] || [ -z "$parameterp" ]
then
  echo "Info: -u AWS_SECRET_KEY_ID or -p AWS_SECRET_KEY or both unspecified. Proceeding without logging into AWS"
else 
# Login
# !!! The prefix space below is important => so bash will not log command in history
 AWS_ACCESS_KEY_ID="$parameteru" AWS_SECRET_ACCESS_KEY="$parameterp" aws ec2 describe-instances
fi


CLEANEDAMAZONARGS=getCleanedArgs()

aws lambda create-function --function-name ${cliArgs['--name']} --handler ${getPackageName(cliArgs)}${getPackageName(cliArgs) ? '.' : ''}Entry::handleRequest --zip-file fileb://amazon.zip --runtime java8 $CLEANEDAMAZONARGS
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

getCleanedArgs()
{
  IGNORENEXT=false
  SNIPPED=""
  for var in "$@"; do
      # - Ditch java2faas custom arguments AWS CLI should never see
      # - Pass through AWS CLI args
      if [ "$var" = '-u' ] || [ "$var" = '-p' ]
      then
        IGNORENEXT=true
        continue
      fi
  
      if [ "$IGNORENEXT" = true ]
      then 
        IGNORENEXT=false
        continue
      fi

      SNIPPED="$SNIPPED $var"
  done
  
  return "$SNIPPED"
}


while getopts "u::p::" opt
do
    case "$opt" in
      u ) parameteru="$OPTARG" ;;
      p ) parameterp="$OPTARG" ;;
      h ) helpFunction
    esac
done

# Print note in case -u or -p are empty
if [ -z "$parameteru" ] || [ -z "$parameterp" ]
then
    echo "Info: -u AWS_SECRET_KEY_ID or -p AWS_SECRET_KEY or both unspecified. Proceeding without logging into AWS";
else 
# Login
# !!! The prefix space below is important => so bash will not log command in history
 AWS_ACCESS_KEY_ID="$parameteru" AWS_SECRET_ACCESS_KEY="$parameterp" aws ec2 describe-instances
fi

gradle build
cd ${path.join('build', 'distributions')}

CLEANEDAMAZONARGS=getCleanedArgs()

aws lambda update-function-code --function-name ${cliArgs['--name']} --zip-file fileb://amazon.zip $CLEANEDAMAZONARGS
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
