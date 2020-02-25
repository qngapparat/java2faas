#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const amazon = require('./core/amazon')
const ibm = require('./core/ibm')

// TODO ensure --name is alphanumeric (since we use it as export name for google)
// TODO don't ask for role if only --google
// TODO handle the nodejs8/10/12 platform differing support (google 8 and 10, aws 10 and 12, ...)

// TODO google, handly xml, multipart, etc https://cloud.google.com/functions/docs/writing/http

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

if (args['--aws-role'] == null) {
  console.log('Specify --aws-role')
  process.exit()
}

amazon(args)
ibm(args)
