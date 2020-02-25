const { runGenerators } = require('./common')
const path = require('path')
// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  'Entry.java': function (cliArgs) {
    // // TODO better name for entry-file
    // // TODO improve this
    // const className = cliArgs['--entry-file'].split(path.sep).slice(-1)[0].split('.')[0]
    // const reqClassName = cliArgs['--request-file'].split(path.sep).slice(-1)[0].split('.')[0]
    // const resClassName = cliArgs['--response-file'].split(path.sep).slice(-1)[0].split('.')[0]
    return {
      code: `
     import com.google.gson.JsonObject;

     public class Entry {
       public static JsonObject main(JsonObject event) {
        
        System.out.println(event);
        return;
        // TODO serialize using response class
       }
     }
    `,
      // where that above should be written to  (relative to project root)     // MUST correspond
      path: path.join(...cliArgs['--entry-file'].split(path.sep).slice(0, -1), 'Entry.java')
    }
  },
  // TODO would this overwrite user build files???

  'build.gradle': function (cliArgs) {
    return {
      code: `
apply plugin: 'java'

version = '1.0'

repositories {
   mavenCentral()
}

configurations {
    provided
    compile.extendsFrom provided
}

dependencies {
     provided 'com.google.code.gson:gson:2.6.2'
    compile 'com.google.zxing:core:3.3.0'
     compile 'com.google.zxing:javase:3.3.0'
}

 jar {
    dependsOn configurations.runtime

   from {
        (configurations.runtime - configurations.provided).collect {
            it.isDirectory() ? it : zipTree(it)
        }
    }
} 
      `,
      path: path.join(cliArgs['--path'], 'build.gradle')
    }
  },

  // TODO we DO wanna overwrite here
  'deploy.sh': function (cliArgs) {
    return {
      code: `
gradle jar
cd ${path.join('build', 'libs')}
# TODO incorporate package name
ibmcloud fn action create ${cliArgs['--name']} file --kind java:8 --main Entry
      `,
      path: path.join(cliArgs['--path'], 'deploy.sh')
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
