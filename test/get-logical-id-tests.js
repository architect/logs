let test = require('tape')
let getLogicalID = require('../src/get-logical-id')

test('should return logical id for path', t => {
  t.plan(1)
  t.equal(getLogicalID('./src/http/get-index'), 'GetIndex')
})

test('should return logical id for websocket path', t => {
  t.plan(1)
  t.equal(getLogicalID('./src/ws/default'), 'WebsocketDefault')
})

test('should return logical id for dynamodb stream path', t => {
  t.plan(1)
  t.equal(getLogicalID('./src/tables/default'), 'DefaultStreamLambda')
})

test('should replace references to 000 in path', t => {
  t.plan(1)
  t.equal(getLogicalID('./src/http/get-api-000version'), 'GetApiVersion')
})
