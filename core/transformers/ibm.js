const path = require('path')
const { runTransformers } = require('./common')
/// ////////////////////////////////
// READ THE NOTES
/// ////////////////////////////////

// A transformator is a function that rewrites a file's content string (typically source code)
const transformers = {
  /**
   * @param {string} cliArgs
   * @param {string} prevCode Previous code (content) of the file
   * @return {{code: string, path: string}} The new content of the file, and the path to save it to
   */
  'build.gradle': function (cliArgs, prevCode) {
    let code = prevCode || '';
    // TODO one closing curly bracket will fuck up regex (ie {{ => } <= })

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
      // There is no repositories field yet - write repositories + mavenCentral
      if (!repositories) {
        code = `${code}\nrepositories {\nmavenCentral()\n}`
        return
      }
      repositories = repositories[0]
      // There is - write mavenCentral
      if (!repositories.includes('mavenCentral')) {
        code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
      }
    })();

    // DEPENDENCY FIELD
    (() => {
      let dependencies = code.match(/dependencies\s*{[^}]*}/)
      // No dependencies field yet - write it
      if (!dependencies) {
        code = `${code}\n
dependencies {
  provided 'com.google.code.gson:gson:2.6.2'
  compile 'com.google.zxing:core:3.3.0'
  compile 'com.google.zxing:javase:3.3.0'
}
      `
        return
      }
      // There is dependencies field already
      dependencies = dependencies[0]
      // Explanation:
      // prepend (by replacing 'dependencies {' with 'dependencies { CUSTOMCODE' )
      // Note the lack of closing } in the replace logic => we keep user-specified deps that follow
      if (!dependencies.includes('com.google.zxing')) {
        code = code.replace(/dependencies\s*{/, `dependencies { 
  provided 'com.google.code.gson:gson:2.6.2'
  compile 'com.google.zxing:core:3.3.0'
  compile 'com.google.zxing:javase:3.3.0'
  `
        )
      }
    })()

    // CONFIGURATIONS FIELD
    // TODO test if having this dupe hurts build.gradle
    code = `
configurations {
  provided
  compile.extendsFrom provided
}
${code}
    `;

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
  archiveName 'ibm.jar'
}  
          `
      }

      // If user wrote a jar task, just replace it
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
