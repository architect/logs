let test = require('tape')
let sinon = require('sinon')
let logs = require('../')
let pretty = require('../src/pretty-print')
let fs = require('fs')

process.chdir(__dirname)
test('`logs` will pretty print not found if no code path is provided', t => {
  t.plan(1)
  let fake = sinon.fake.returns()
  sinon.replace(pretty, 'notFound', fake)
  logs({})
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
  logs({ pathToCode: path }, function done (err) {
    if (err) t.fail(err)
    else {
      t.equals(fakeTwo.lastCall.args[0].pathToCode, path, 'pathToCode passed to read method')
    }
  })
  sinon.restore()
})
test('`logs` invokes `nuke` when specified via args and passes the path to it', t => {
  t.plan(1)
  let fake = sinon.fake.returns(true)
  sinon.replace(fs, 'existsSync', fake)
  let fakeTwo = sinon.fake.yields()
  sinon.replace(logs, 'nuke', fakeTwo)
  let path = 'the/path/to/code/is/fraught/with/peril'
  logs({ pathToCode: path, nuke: true }, function done (err) {
    if (err) t.fail(err)
    else {
      t.equals(fakeTwo.lastCall.args[0].pathToCode, path, 'pathToCode passed to nuke method')
    }
  })
  sinon.restore()
})
