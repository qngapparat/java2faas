const fs = require('fs')
const mockfs = require('mock-fs')

const { copy } = require('./index')

// run before each test
beforeEach(() => {
  // setup mock fs
  mockfs({
    '.hiddendir': {
      'somefileinhiddenfolder': 'weoginwgoiwn owin gweg'
    },
    'normaldir': {
      'somefile.txt': 'oweignweogiwnegowngweog'
    },
    'build.gradle': 'woegnweoigwne wognwe oign',
    'src/main/java': {
      'Hello.java': 'weognwego wnngow nw',
      'Request.java': ' lkwemglw mgwelg nwl gwne',
      'Response.java': 'wgenwegown weo gwngo wmn '

    }
  })
})

// run after each test
afterEach(() => {
  // remove mock fs
  mockfs.restore()
})

test('Throws when srcDir doesnt exist', () => {
  fs.mkdirSync('dest')
  expect(() => copy('invaliddir', 'dest', []))
    .toThrow()
})

test('Throws when destDir doesnt exist', () => {
  expect(() => copy(process.cwd(), 'invaliddir', []))
    .toThrow()
})

test('Implicitly adds dstDir to except so it doesnt throw', () => {
  fs.mkdirSync('dest')
  const fn = jest.fn(() => copy('.', 'dest', ['normaldir']))
  fn()
  expect(fn).toHaveReturned()
})

test('Correctly ignores specified dir | normal dir', () => {
  expect((() => {
    fs.mkdirSync('dest')
    copy('.', 'dest', ['normaldir'])
    // ensure dest has exactly the following files (without normaldir)
    const expected = ['build.gradle', 'src', '.hiddendir'].sort()
    // throw new Error(fs.readdirSync('dest'))
    return fs.readdirSync('dest')
      .sort()
      .every((val, idx) => expected.indexOf(val) === idx)
  })()).toBeTruthy()
})

test('Correctly ignores specified dir | hidden dir', () => {
  expect((() => {
    fs.mkdirSync('dest')
    copy('.', 'dest', ['.hiddendir'])
    // ensure dest has exactly the following files (without .hiddendir)
    const expected = ['build.gradle', 'src', 'normaldir'].sort()
    // throw new Error(fs.readdirSync('dest'))
    return fs.readdirSync('dest')
      .sort()
      .every((val, idx) => expected.indexOf(val) === idx)
  })()).toBeTruthy()
})
