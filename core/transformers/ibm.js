const { runTransformers } = require('./common')

const Js2XML = require('fast-xml-parser').j2xParser
const XML2Js = require('fast-xml-parser')
// convenience wrappers
const jstoxml = new Js2XML({ attributeNamePrefix: '0_', ignoreAttributes: false })
const xmltojs = (str) => XML2Js(str, { attributeNamePrefix: '0_', ignoreAttributes: false })

const DEPS = {
  dependency: [
    { artifactId: 'gson', groupId: 'com.google.code.gson', version: '2.6.2' },
    { artifactId: 'core', groupId: 'com.google.zxing', version: '3.3.0' },
    { artifactId: 'javase', groupId: 'com.google.zxing', version: '3.3.0' }
  ]
}

const PLUGS = {
  plugin: [
    {
      groupId: 'org.apache.maven.plugins',
      artifactId: 'maven-shade-plugin',
      version: '3.2.2',
      configuration: {
        createDependencyReducedPom: false
      },
      executions: {
        execution: [
          {
            phase: 'package',
            goals: {
              goal: 'shade'
            }
          }
        ]
      }
    }
  ]
}

// A transformator is a function that rewrites a file's content string (typically source code)
const transformers = {

  'pom.xml': function (cliArgs, prevCode) {
    if (!prevCode || prevCode.trim() === '') {
      return {
        code: `
        <project xmlns="http://maven.apache.org/POM/4.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                              http://maven.apache.org/xsd/maven-4.0.0.xsd">
          <modelVersion>4.0.0</modelVersion>
        
          <groupId>org.lambdagroupid</groupId>
          <artifactId>my-lambda</artifactId>
          <version>1.0</version>
        
          <dependencies>
          
            ${jstoxml.parse(DEPS)}
          
          </dependencies>
        
          <build>
            <plugins>
            
            ${jstoxml.parse(PLUGS)}
    
            </plugins>
          </build>
        </project>`,
        path: 'pom.xml'
      }
    }

    /// ////////////////////////////////////////////
    // Case 2: user pom exists
    // parse it

    const c = xmltojs(prevCode)

    // ensure nesting is there
    if (!c.project.dependencies || !c.project.dependencies.dependency) {
      c.project.dependencies = { dependency: [] }
    }

    if (!c.project.build || !c.project.build.plugins || !c.project.build.plugins.plugin) {
      c.project.build = {
        plugins: {
          plugin: []
        }
      }
    }

    // pour deps and plugins down into that nesting (appending it; not overwriting user stuff)
    c.project.dependencies.dependency.push(...DEPS)
    c.project.build.plugins.plugin.push(...PLUGS)

    // set artifact id and version (because deploy.sh then expects my-lambda-1.0.jar)
    c.project.artifactId = 'my-lambda'
    c.project.version = '1.0'

    // back to XML
    const cxml = jstoxml(c)

    return {
      code: cxml,
      path: 'pom.xml'
    }
  }
  /**
   * @param {string} cliArgs
   * @param {string} prevCode Previous code (content) of the file
   * @return {{code: string, path: string}} The new content of the file, and the path to save it to
   */
  //   'build.gradle': function (cliArgs, prevCode) {
  //     let code = prevCode || ''
  //     // TODO one closing curly bracket will fuck up regex (ie {{ => } <= })

  //     // APPLY PLUGIN JAVA FIELD
  //     {
  //       const applypluginjava = code.match(/apply\s*plugin\s*:\s*'java'/)
  //       if (!applypluginjava) {
  //         code = `apply plugin: 'java'\n${code}`
  //       }
  //     }

  //     // REPOSITORY FIELD
  //     {
  //       let repositories = code.match(/repositories\s*{[^}]*}/)
  //       // There is no repositories field yet - write repositories + mavenCentral
  //       if (!repositories) {
  //         code = `${code}\nrepositories {\nmavenCentral()\n}`
  //         return
  //       }
  //       repositories = repositories[0]
  //       // There is - write mavenCentral
  //       if (!repositories.includes('mavenCentral')) {
  //         code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
  //       }
  //     }

  //     // DEPENDENCY FIELD
  //     {
  //       let dependencies = code.match(/dependencies\s*{[^}]*}/)
  //       // No dependencies field yet - write it
  //       if (!dependencies) {
  //         code = `${code}\n
  // dependencies {
  //   provided 'com.google.code.gson:gson:2.6.2'
  //   compile 'com.google.zxing:core:3.3.0'
  //   compile 'com.google.zxing:javase:3.3.0'
  // }
  //       `
  //         return
  //       }
  //       // There is dependencies field already
  //       dependencies = dependencies[0]
  //       // Explanation:
  //       // prepend (by replacing 'dependencies {' with 'dependencies { CUSTOMCODE' )
  //       // Note the lack of closing } in the replace logic => we keep user-specified deps that follow
  //       if (!dependencies.includes('com.google.zxing')) {
  //         code = code.replace(/dependencies\s*{/, `dependencies {
  //   provided 'com.google.code.gson:gson:2.6.2'
  //   compile 'com.google.zxing:core:3.3.0'
  //   compile 'com.google.zxing:javase:3.3.0'
  //   `
  //         )
  //       }
  //     }

  //     // CONFIGURATIONS FIELD
  //     // TODO test if having this dupe hurts build.gradle
  //     code = `
  // configurations {
  //   provided
  //   compile.extendsFrom provided
  // }
  // ${code}
  //     `

  //     // JAR FIELD
  //     {
  //       const jar = code.match(/jar\s*{/)
  //       if (!jar) {
  //         code = `${code}
  // jar {
  //   dependsOn configurations.runtime
  //   from {
  //       (configurations.runtime - configurations.provided).collect {
  //           it.isDirectory() ? it : zipTree(it)
  //       }
  //   }
  //   archiveName 'ibm.jar'
  // }
  //           `
  //       }

  //       // If user wrote a jar task, just replace it
  //       else {
  //         code = code.replace(/jar\s*{[^}]*}/, `jar {
  //   dependsOn configurations.runtime

  //   from {
  //     (configurations.runtime - configurations.provided).collect {
  //         it.isDirectory() ? it : zipTree(it)
  //     }
  //   }
  // }
  //         `)
  //       }
  //     }

//     return {
//       code: code,
//       path: 'build.gradle'
//     }
//   }
}

function transformAll (cliArgs) {
  return runTransformers(cliArgs, transformers)
}

module.exports = {
  transformAll
}
