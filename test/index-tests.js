let test = require('tape')
let sinon = require('sinon')
let logs = require('../')
let pretty = require('../src/pretty-print')
let _inventory = require('@architect/inventory')
let fs = require('fs')
let inventory
process.chdir(__dirname)

test('Set up env', t => {
  t.plan(2)
  t.ok(logs, 'Env module is present')
  _inventory({}, (err, result) => {
    if (err) t.fail(err)
    else {
      inventory = result
      t.pass('Got inventory')
    }
  })
})

test('`logs` will pretty print not found if no code path is provided', t => {
  t.plan(1)
  let fake = sinon.fake.returns()
  sinon.replace(pretty, 'notFound', fake)
  logs({ inventory })
  t.ok(fake.calledOnce, '`pretty.notFound` invoked once')
  sinon.restore()
})

test('`logs` invokes `read` by default and passes the path to it', t => {
  t.plan(1)
  let fake = sinon.fake.returns(true)
  sinon.replace(fs, 'existsSync', fake)
  let fakeTwo = sinon.fake.yields()
  sinon.replace(logs, 'read', fakeTwo)
  let path = 'the/path/to/code/is/fraught/with/peril'
  logs({ inventory, pathToCode: path }, function done (err) {
    if (err) t.fail(err)
    else {
      t.equals(fakeTwo.lastCall.args[0].pathToCode, path, 'pathToCode passed to read method')
    }
    sinon.restore()
  })
})

test('`logs` invokes `destroy` when specified via args and passes the path to it', t => {
  t.plan(1)
  let fake = sinon.fake.returns(true)
  sinon.replace(fs, 'existsSync', fake)
  let fakeTwo = sinon.fake.yields()
  sinon.replace(logs, 'destroy', fakeTwo)
  let path = 'the/path/to/code/is/fraught/with/peril'
  logs({ inventory, pathToCode: path, destroy: true }, function done (err) {
    if (err) t.fail(err)
    else {
      t.equals(fakeTwo.lastCall.args[0].pathToCode, path, 'pathToCode passed to destroy method')
    }
    sinon.restore()
  })
})
