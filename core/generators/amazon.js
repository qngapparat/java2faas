const { runGenerators } = require('./common')
const path = require('path')
// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO better name for entry-file
    // TODO improve this
    const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const reqClassName = cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
    const resClassName = cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]
    return {
      code: `
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
      // ??? not rlly where that above should be written to  (relative to project root)     // MUST correspond
      path: path.join(...cliArgs['--entry-file'].split(path.sep).slice(0, -1), 'Entry.java')
    }
  },
  // TODO would this overwrite user build files???

  'build.gradle': function (cliArgs) {
    return {
      code: `
      apply plugin: 'java'

      repositories {
          mavenCentral()
      }
      
      dependencies {
          compile (
              'com.amazonaws:aws-lambda-java-core:1.2.0',
              'com.amazonaws:aws-lambda-java-events:2.2.7'
          )
          compile 'com.google.code.gson:gson:2.6.2'
      
      }
      
      task buildZip(type: Zip) {
          from compileJava
          from processResources
          into('lib') {
              from configurations.runtimeClasspath
          }
      }
      
      build.dependsOn buildZip      
      `,
      path: path.join(cliArgs['--path'], 'build.gradle')
    }
  },

  // TODO we DO wanna overwrite here
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
 * @returns {[{content, path}]}
 */
function generateAll (cliArgs) {
  return runGenerators(cliArgs, generators)
}

module.exports = {
  generateAll
}
