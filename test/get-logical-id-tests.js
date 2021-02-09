let test = require('tape')
let mockRequire = require('mock-require')
let _inventory = require('@architect/inventory')
let { sep, join } = require('path')
let getLogicalID = require('../src/get-logical-id')
let inventory

test('Set up env', t => {
  t.plan(2)
  t.ok(getLogicalID, 'Logical ID module is present')
  let rawArc = '@app\nappname\n@http\nget /\nget /api/:version\n@ws\n@plugins\nmyplugin\n@myplugin\ncustom-funk'
  mockRequire(join(process.cwd(), 'src', 'plugins', 'myplugin.js'), {
    pluginFunctions: function () {
      return [ {
        src: 'src/myplugin/custom-funk',
        body: 'my body is my temple'
      } ]
    }
  })
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
  t.equal(getLogicalID(inventory, `.${sep}src${sep}http${sep}get-index`), 'GetIndexHTTPLambda')
})

test('should return logical id for websocket path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}ws${sep}default`), 'DefaultWSLambda')
})

test('should replace references to 000 in path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}http${sep}get-api-000version`), 'GetApiVersionHTTPLambda')
})

test('should blow up on unknown path', t => {
  t.plan(1)
  t.throws(() => {
    getLogicalID(inventory, `.${sep}src${sep}http${sep}idk`)
  }, 'Threw on unknown path')
})

// TODO: uncomment this once inventory dependency is bumped
test.skip('should include PluginLambda for plugin-registered Lambdas', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}myplugin${sep}custom-funk`), 'CustomFunkPluginLambda')
})
