let test = require('tape')
let _inventory = require('@architect/inventory')
let getLogicalID = require('../src/get-logical-id')
let inventory

test('Set up env', t => {
  t.plan(2)
  t.ok(getLogicalID, 'Logical ID module is present')
  let rawArc = '@app\nappname\n@http\nget /\nget /api/:version\n@ws'
  _inventory({ rawArc }, (err, result) => {
    if (err) t.fail(err)
    else {
      inventory = result
      t.pass('Got inventory')
    }
  })
})

test('should return logical id for path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, './src/http/get-index'), 'GetIndexHTTPLambda')
})

test('should return logical id for websocket path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, './src/ws/default'), 'DefaultWSLambda')
})

test('should replace references to 000 in path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, './src/http/get-api-000version'), 'GetApiVersionHTTPLambda')
})

test('should blow up on unknown path', t => {
  t.plan(1)
  t.throws(() => {
    getLogicalID(inventory, './src/http/idk')
  }, 'Threw on unknown path')
})
