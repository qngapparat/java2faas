// const fs = require('fs')
// const path = require('path')
// const uuidv4 = require('uuid').v4
// const { execSync } = require('child_process')
// const { transformAll } = require('./amazon')
// // run before each test
// let runuuid

// beforeEach(() => {
//   runuuid = uuidv4()
//   // setup mock fs
//   fs.mkdirSync(`/tmp/${runuuid}`)
//   fs.mkdirSync(`/tmp/${runuuid}/amazon`)
//   fs.writeFileSync(`/tmp/${runuuid}/build.gradle`, `
// apply plugin: 'java'

// repositories {
//   mavenCentral()
//   jcenter()
// }

// dependencies {
//   // https://mvnrepository.com/artifact/junit/junit
//   testCompile group: 'junit', name: 'junit', version: '4.12'
//   // https://mvnrepository.com/artifact/org.webjars.bower/open-sans
//   runtime group: 'org.webjars.bower', name: 'open-sans', version: '1.1.0'
// }
//   `)
// })

// // run after each test
// afterEach(() => {
//   runuuid = null
// })

// describe('Transformers', () => {
//   describe('build.gradle', () => {
//     // test('builds before java2faas', () => {
//     //   const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/build.gradle`))
//     //   fn()
//     //   expect(fn).toHaveReturned()
//     // })

//     test('builds after java2faas transformer | valid prevCode', () => {
//       // fs.mkdirSync('amazon')
//       const mockCliArgs = {
//         '--path': `/tmp/${runuuid}`
//       }

//       // fs.writeFileSync(t.path.split(path.sep).slice(-1), t.code)
//       // write transformed files
//       const transformed = transformAll(mockCliArgs)
//       transformed.forEach(t => fs.writeFileSync(path.join(mockCliArgs['--path'], 'amazon', t.path), t.code)
//       )
//       const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
//       fn()
//       expect(fn).toHaveReturned()
//     })

//     test('builds after java2faas transformer | empty prevCode', () => {
//       const mockCliArgs = {
//         '--path': `/tmp/${runuuid}`
//       }

//       // write empty build.gradle file as start
//       fs.writeFileSync(`/tmp/${runuuid}/build.gradle`, ' ')

//       const transformed = transformAll(mockCliArgs)
//       transformed.forEach(t => fs.writeFileSync(path.join(mockCliArgs['--path'], 'amazon', t.path), t.code)
//       )
//       const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
//       fn()
//       expect(fn).toHaveReturned()
//     })

//     test('NOT builds after java2faas transformer | invalid prevcode', () => {
//       const mockCliArgs = {
//         '--path': `/tmp/${runuuid}`
//       }

//       // write empty build.gradle file as start
//       fs.writeFileSync(`/tmp/${runuuid}/build.gradle`, ' INVALID BUILD GRADLE CONTENT\n ')

//       const transformed = transformAll(mockCliArgs)
//       transformed.forEach(t => fs.writeFileSync(path.join(mockCliArgs['--path'], 'amazon', t.path), t.code)
//       )
//       expect(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
//         .toThrow()
//     })
//   })
// })
