const { runTransformers } = require('./common')

const Js2XML = require('fast-xml-parser').j2xParser
const XML2Js = require('fast-xml-parser')

const jstoxml = new Js2XML({ attributeNamePrefix: "0_", ignoreAttributes: false })
const xmltojs = new XML2Js({ attributeNamePrefix: "0_", ignoreAttributes: false })

let deps = {
  dependency: [
    { artifactId: 'aws-lambda-java-core', groupId: 'com.amazonaws', version: '1.2.0' },
    { artifactId: 'aws-lambda-java-events', groupId: 'com.amazonaws', version: '2.2.7' },
    { artifactId: 'aws-lambda-java-core', groupId: 'com.amazonaws', version: '1.1.0' },
  ]
}

let plugs = {
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


/// ////////////////////////////////
// READ THE NOTES
/// ////////////////////////////////

// TODO remove apply application/eclipse ??
// TODO or is the programmer assumed to not write that there??

// A transformator is a function that rewrites a file's content string (typically source code)
const transformers = {


  'pom.xml': function (cliArgs, prevCode) {
    let code = prevCode || `
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                      http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
 
  <groupId>org.lambdagroupid</groupId>
  <artifactId>my-lambda</artifactId>
  <version>1.0</version>

</project>
`

  }

  /**
   * @param {string} cliArgs
   * @param {string} prevCode Previous code (content) of the file
   * @return {{code: string, path: string}} The new content of the file, and the path to save it to
   */
  'build.gradle': function (cliArgs, prevCode) {
    let code = prevCode || ''

    // APPLY PLUGIN JAVA FIELD
    {
      const applypluginjava = code.match(/apply\s*plugin\s*:\s*'java'/)
      if (!applypluginjava) {
        code = `apply plugin: 'java'\n${code}`
      }
    }

    // REPOSITORY FIELD
    {
      let repositories = code.match(/repositories\s*{[^}]*}/)
      if (!repositories) {
        code = `${code}\n repositories { \nmavenCentral() \n}`
      } else {
        repositories = repositories[0]
        if (!repositories.includes('mavenCentral')) {
          code = code.replace(/repositories\s*{/, 'repositories { mavenCentral()\n')
        }
      }
    }

    // DEPENDENCY FIELD
    {
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
    }

    // TASK FIELD
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

    return {
      code: code,
      path: 'build.gradle'
    }
  }
}

function transformAll(cliArgs) {
  return runTransformers(cliArgs, transformers)
}

module.exports = {
  transformAll
}
