const path = require('path')
const { runTransformers } = require('./common')

/**
 * Extract balanced-bracket groovy expressions like 'repositories { ...[{ ... }] ... }' from a string
 * @param {string} sel eg. 'repositories'
 * @param {string} code The whole code string
 */

// TODO DO WE REALLY NEED THIS??
// we just do
// * new writes
// * head inserts ('repos {' => 'repos { DATA' )
// and when matching we already match repos\s*{
// we dont care about how nested user expr may be
// there will every only be one 'repos\s*{' anyway

// TODO test this
function groovyMatch (code, sel) {
  // see if sel is even literally included
  const lit = code.match(sel)
  if (!lit) return lit
  else {
    // traverse everything behind eg. 'repositories' char by char and count opening/closing brackets

    // we're interested in:
    // a) what comes behind sel (sel could be 'repositores' and so on)
    // b) if it's a balanced bracket expression
    // IF IT IS => return it
    // IF NOT => return ''
    const suffixes = code.split(sel)
    const r = suffixes.map(suf => {
      let suffixExtract = ''
      let pendingBrackets = 0
      let allowTermination = false
      for (const ch of suf) {
        // first encountered ch MUST be whitespace, \n or {
        // otherwise fail
        if (allowTermination === false && !ch.match(/\s/) && ch !== '{') {
          return ''
        }
        if (ch === '{') pendingBrackets += 1
        if (ch === '}') pendingBrackets -= 1
        suffixExtract += ch
        //  eg. 'repositories' isn't valid, but 'repositories { ... }' is
        // => allow termination after we encounter our first opening bracket
        if (allowTermination === false && pendingBrackets > 0) allowTermination = true
        if (pendingBrackets === 0 && allowTermination) break
      }
      // resulting extract should have at least one opening or closing bracket (failsafe)
      if (!suffixExtract.match(/[{}]/)) return ''
      return suffixExtract
    })

    // not interested in ''
    return r.filter(ch => ch !== '')
  }
}

/**
 * Replaces first occurence of fromStr with toStr, in code
 */
function groovyReplaceOne (code, fromStr, toStr) {
  let m = groovyMatch(code, fromStr)
  if (!m) {
    console.log(`Could not replace ${fromStr} => ${toStr} in ${code}`)
    return
  }
  m = m[0]
  return code.replace(m, toStr)
}

const transformers = {
  'build.gradle': function (cliArgs, prevCode) {
    let code = prevCode || '';
    // TODO one closing curly bracket will fuck up regex (ie {{ => } <= })

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

const res = groovyMatch(`apply plugin: 'java'

// tag::repositories[]
repositories {
    mavenCentral()
}
// end::repositories[]

// tag::jar[]
jar {
    baseName = 'gs-gradle'
    version =  '0.1.0'
}
// end::jar[]

// tag::dependencies[]
sourceCompatibility = 1.8
targetCompatibility = 1.8

dependencies { 
  compile (
    'com.amazonaws:aws-lambda-java-core:1.2.0',
    'com.amazonaws:aws-lambda-java-events:2.2.7'
  )
  compile 'com.google.code.gson:gson:2.6.2'
  
    compile "joda-time:joda-time:2.2"
    testCompile "junit:junit:4.12"
}

task buildZip(type: Zip) {
  from compileJava
  from processResources
  into('lib') {
      from configurations.runtimeClasspath
  }
}

build.dependsOn buildZip
    `, 'repositories')

console.log(res)
