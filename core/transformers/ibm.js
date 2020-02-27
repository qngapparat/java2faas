const path = require('path')
const { runTransformers } = require('./common')

const transformers = {
  'build.gradle': function (cliArgs, prevCode) {
    let code = prevCode || '';

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
  provided 'com.google.code.gson:gson:2.6.2'
  compile 'com.google.zxing:core:3.3.0'
  compile 'com.google.zxing:javase:3.3.0'
}
      `
        return
      }

      dependencies = dependencies[0]
      // prepend (by replacing 'dependencies {' with 'dependencies { CODE' )
      // Note the lack of closing } in the replace logic => we keep user-specified deps
      if (!dependencies.includes('com.google.zxing')) {
        code = code.replace(/dependencies\s*{/, `dependencies { 
  provided 'com.google.code.gson:gson:2.6.2'
  compile 'com.google.zxing:core:3.3.0'
  compile 'com.google.zxing:javase:3.3.0'
  `
        )
      }
    })();

    // JAR FIELD
    (() => {
      const jar = code.match(/jar\s*{/)
      if (!jar) {
        code = `${code}
jar {
  dependsOn configurations.runtime
  from {
      (configurations.runtime - configurations.provided).collect {
          it.isDirectory() ? it : zipTree(it)
      }
  }
}  
          `
      }

      // If user wrote a jarbuilding task, replace it

      else {
        code = code.replace(/jar\s*{[^}]*}/, `jar {
  dependsOn configurations.runtime

  from {
    (configurations.runtime - configurations.provided).collect {
        it.isDirectory() ? it : zipTree(it)
    }
  }
} 
        `)
      }
    })()

    // CONFIGURATIONS FIELD
    // TODO test if having this dupe hurts build.gradle
    code = `${code}
configurations {
  provided
  compile.extendsFrom provided
}
    `

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
