const path = require('path')
const { runTransformers } = require('./common')

// TODO test this transformer (& gradle build succeeds) on ... build.gradle files

// A transformator is a function that takes the user-input CLI args, and mutates a file content string
const transformers = {
  'build.gradle': function (cliArgs, prevCode) {
    // TODO make sure it produces sufficient build.gralde with empty prevCode
    let code = prevCode || '';
    // DEVNOTE: Using immediately-invoked function expressions (IIFE) to keep namespace clean

    // APPLY PLUGIN JAVA FIELD
    (() => {
      const applypluginjava = code.match(/apply\s*plugin\s*:\s*'java'/)
      if (!applypluginjava) {
        code = `apply plugin: 'java'
${code}
        `
      }
    })();

    // REPOSITORY FIELD
    (() => {
      let repositories = code.match(/repositories\s*{[^}]*}/)
      if (!repositories) {
        code = `${code}\n repositories { 
mavenCentral() 
}`
        return
      }
      repositories = repositories[0]
      if (!repositories.includes('mavenCentral')) {
        code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
      }
    })();

    // DEPENDENCY FIELD
    (() => {
      let dependencies = code.match(/dependencies\s*{[^}]*}/)
      if (!dependencies) { // write 'dependencies { ... }'
        code = `${code}\n 
dependencies {
  compile (
    'com.amazonaws:aws-lambda-java-core:1.2.0',
    'com.amazonaws:aws-lambda-java-events:2.2.7'
  )
  compile 'com.google.code.gson:gson:2.6.2'
}
      `
        return
      }

      dependencies = dependencies[0]
      // prepend (by replacing 'dependencies {' with 'dependencies { CODE' )
      // Note the lack of closing } in the replace logic => we keep user-specified deps
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
