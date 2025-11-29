const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert/strict')
const logs = require('../')
const pretty = require('../src/pretty-print')
const _inventory = require('@architect/inventory')
const fs = require('fs')
let inventory
process.chdir(__dirname)

describe('logs module', () => {
  before(async () => {
    assert.ok(logs, 'Env module is present')
    process.env.AWS_ACCESS_KEY_ID = 'yo'
    process.env.AWS_SECRET_ACCESS_KEY = 'yo'

    // Convert callback-based inventory to promise
    inventory = await new Promise((resolve, reject) => {
      _inventory({}, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
    assert.ok(inventory, 'Got inventory')
  })

  after(() => {
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY
    mock.restoreAll()
  })

  it('will pretty print not found if no code path is provided', () => {
    mock.method(pretty, 'notFound', () => {})
    logs({ inventory })
    assert.strictEqual(pretty.notFound.mock.calls.length, 1, '`pretty.notFound` invoked once')
    mock.restoreAll()
  })

  it('invokes `read` by default and passes the path to it', async () => {
    mock.method(fs, 'existsSync', () => true)
    mock.method(logs, 'read', (args, callback) => callback())

    const path = 'the/path/to/code/is/fraught/with/peril'

    await new Promise((resolve, reject) => {
      logs({ inventory, pathToCode: path }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const readCalls = logs.read.mock.calls
    assert.strictEqual(readCalls.length, 1, 'read method called once')
    assert.strictEqual(readCalls[0].arguments[0].pathToCode, path, 'pathToCode passed to read method')
    mock.restoreAll()
  })

  it('invokes `destroy` when specified via args and passes the path to it', async () => {
    mock.method(fs, 'existsSync', () => true)
    mock.method(logs, 'destroy', (args, callback) => callback())

    const path = 'the/path/to/code/is/fraught/with/peril'

    await new Promise((resolve, reject) => {
      logs({ inventory, pathToCode: path, destroy: true }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const destroyCalls = logs.destroy.mock.calls
    assert.strictEqual(destroyCalls.length, 1, 'destroy method called once')
    assert.strictEqual(destroyCalls[0].arguments[0].pathToCode, path, 'pathToCode passed to destroy method')
    mock.restoreAll()
  })
})
