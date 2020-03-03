const path = require('path')
const { runTransformers } = require('./common')
/// ////////////////////////////////
// READ THE NOTES
/// ////////////////////////////////

// TODO remove apply application/eclipse ??
// TODO or is the programmer assumed to not write that there??

// A transformator is a function that rewrites a file's content string (typically source code)
const transformers = {
  /**
   * @param {string} cliArgs
   * @param {string} prevCode Previous code (content) of the file
   * @return {{code: string, path: string}} The new content of the file, and the path to save it to
   */
  'build.gradle': function (cliArgs, prevCode) {
    let code = prevCode || '';

    // APPLY PLUGIN JAVA FIELD
    (() => {
      const applypluginjava = code.match(/apply\s*plugin\s*:\s*'java'/)
      if (!applypluginjava) {
        code = `apply plugin: 'java'\n${code}`
      }
    })();

    // REPOSITORY FIELD
    (() => {
      let repositories = code.match(/repositories\s*{[^}]*}/)
      if (!repositories) {
        code = `${code}\n repositories { \nmavenCentral() \n}`
      } else {
        repositories = repositories[0]
        if (!repositories.includes('mavenCentral')) {
          code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
        }
      }
    })();

    // DEPENDENCY FIELD
    (() => {
      let dependencies = code.match(/dependencies\s*{[^}]*}/)
      if (!dependencies) {
        code = `${code}\n 
dependencies {
  compile (
    'com.amazonaws:aws-lambda-java-core:1.2.0',
    'com.amazonaws:aws-lambda-java-events:2.2.7'
  )
  compile 'com.google.code.gson:gson:2.6.2'
}
      `
      } else {
        dependencies = dependencies[0]
        if (!dependencies.includes('amazonaws:aws-lambda-java')) {
          code = code.replace(/dependencies\s*{/, `dependencies { 
compile (
  'com.amazonaws:aws-lambda-java-core:1.2.0',
  'com.amazonaws:aws-lambda-java-events:2.2.7'
)
compile 'com.google.code.gson:gson:2.6.2'
    `
          )
        }
      }
    })();

    // TASK FIELD
    (() => {
      code = `${code}\n
task buildZip(type: Zip) {
  from compileJava
  from processResources
  into('lib') {
      from configurations.runtimeClasspath
  }
}

build.dependsOn buildZip
    `
    })()

    return {
      code: code,
      path: path.join(cliArgs['--path'], 'build.gradle')
    }
  }
}

function transformAll (cliArgs) {
  return runTransformers(cliArgs, transformers)
}

module.exports = {
  transformAll
}
