const { runTransformers } = require('./common')

const Js2XML = require('fast-xml-parser').j2xParser
const XML2Js = require('fast-xml-parser')
// convenience wrappers
const jstoxml = new Js2XML({ attributeNamePrefix: '0_', ignoreAttributes: false })
const xmltojs = (str) => XML2Js.parse(str, { attributeNamePrefix: '0_', ignoreAttributes: false })

// TODO don't copy hiddendirs

// The stuff we'll write to the pom, as JS objects
const DEPS = {
  dependency: [
    { artifactId: 'aws-lambda-java-core', groupId: 'com.amazonaws', version: '1.2.0' },
    { artifactId: 'aws-lambda-java-events', groupId: 'com.amazonaws', version: '2.2.7' },
    { artifactId: 'aws-lambda-java-log4j2', groupId: 'com.amazonaws', version: '1.1.0' }
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

// TODO remove apply application/eclipse ??
// TODO or is the programmer assumed to not write that there??

// A transformator is a function that rewrites a file's content string (typically source code)
const transformers = {

  'pom.xml': function (cliArgs, prevCode) {
    // Case 1: user has no pom file - write from scratch
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
  //       if (!repositories) {
  //         code = `${code}\n repositories { \nmavenCentral() \n}`
  //       } else {
  //         repositories = repositories[0]
  //         if (!repositories.includes('mavenCentral')) {
  //           code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
  //         }
  //       }
  //     }

  //     // DEPENDENCY FIELD
  //     {
  //       let dependencies = code.match(/dependencies\s*{[^}]*}/)
  //       if (!dependencies) {
  //         code = `${code}\n
  // dependencies {
  //   compile (
  //     'com.amazonaws:aws-lambda-java-core:1.2.0',
  //     'com.amazonaws:aws-lambda-java-events:2.2.7'
  //   )
  //   compile 'com.google.code.gson:gson:2.6.2'
  // }
  //       `
  //       } else {
  //         dependencies = dependencies[0]
  //         if (!dependencies.includes('amazonaws:aws-lambda-java')) {
  //           code = code.replace(/dependencies\s*{/, `dependencies {
  // compile (
  //   'com.amazonaws:aws-lambda-java-core:1.2.0',
  //   'com.amazonaws:aws-lambda-java-events:2.2.7'
  // )
  // compile 'com.google.code.gson:gson:2.6.2'
  //     `
  //           )
  //         }
  //       }
  //     }

  //     // TASK FIELD
  //     code = `${code}\n
  // task buildZip(type: Zip) {
  //   from compileJava
  //   from processResources
  //   into('lib') {
  //       from configurations.runtimeClasspath
  //   }
  // }

  // build.dependsOn buildZip
  //     `

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
