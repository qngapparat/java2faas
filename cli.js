#!/usr/bin/env node
const amazon = require('./core/amazon')
const ibm = require('./core/ibm')

// TODO handle java packages/package names
const arg = require('arg')

const args = arg({
  '--path': String,
  '--entry-file': String,
  '--request-file': String,
  '--response-file': String,
  '--entry-method': String,
  '--name': String,
  '--aws-role': String
})

if (args['--path'] == null) {
  console.log('Specify --path')
  process.exit()
}

if (args['--entry-file'] == null) {
  // ie src/main/java/Hello.java
  console.log('Specify --entry-file')
  process.exit()
}

if (args['--request-file'] == null) {
  // ie src/main/java/Hello.java
  console.log('Specify --request-file')
  process.exit()
}

if (args['--response-file'] == null) {
  // ie src/main/java/Hello.java
  console.log('Specify --response-file')
  process.exit()
}

if (args['--entry-method'] == null) {
  // ie handleRequest
  console.log('Specify --entry-method')
  process.exit()
}

if (args['--name'] == null) {
  console.log('Specify --name')
  process.exit()
}

if (args['--name'].match(/^[a-zA-Z0-9]+$/) === false) {
  console.log('--name must be alphanumeric (a-z A-Z 0-9)')
}

if (args['--aws-role'] == null) {
  console.log('Specify --aws-role')
  process.exit()
}

amazon(args)
ibm(args)
