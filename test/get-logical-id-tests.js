let test = require('tape')
let mockFs = require('mock-fs')
let mockRequire = require('mock-require')
let _inventory = require('@architect/inventory')
let { sep, join } = require('path')
let getLogicalID = require('../src/get-logical-id')
let inventory

test('Set up env', t => {
  t.plan(2)
  t.ok(getLogicalID, 'Logical ID module is present')
  let rawArc = '@app\nappname\n@http\nget /\nget /api/:version\n@ws\n@plugins\nmyplugin\n@myplugin\ncustom-funk'
  let fakePluginPath = join(process.cwd(), 'src', 'plugins', 'myplugin.js')
  // because mock-fs forces you to use / even on windows :| :| :|
  let unixFakePluginPath = fakePluginPath.replace(/\\/g, '/')
  let mocks = {}
  mocks[unixFakePluginPath] = 'fake file contents'
  mockRequire(fakePluginPath, {
    pluginFunctions: function () {
      return [ {
        src: join(process.cwd(), 'src', 'myplugin', 'custom-funk'),
        body: 'my body is my temple'
      } ]
    }
  })
  mockFs(mocks)
  _inventory({ rawArc }, (err, result) => {
    if (err) t.fail(err)
    else {
      inventory = result
      t.pass('Got inventory')
    }
  })
})

test('get-logical-id should return logical id for path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}http${sep}get-index`), 'GetIndexHTTPLambda')
})

test('get-logical-id should return logical id for websocket path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}ws${sep}default`), 'DefaultWSLambda')
})

test('get-logical-id should replace references to 000 in path', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}http${sep}get-api-000version`), 'GetApiVersionHTTPLambda')
})

test('get-logical-id should blow up on unknown path', t => {
  t.plan(1)
  t.throws(() => {
    getLogicalID(inventory, `.${sep}src${sep}http${sep}idk`)
  }, 'Threw on unknown path')
})

test('get-logical-id should include name plugin-registered Lambdas based on the path and contain a PluginLambda suffix', t => {
  t.plan(1)
  t.equal(getLogicalID(inventory, `.${sep}src${sep}myplugin${sep}custom-funk`), 'MypluginCustomFunkPluginLambda')
})

test('get-logical-id teardown env', t => {
  t.plan(1)
  mockRequire.stopAll()
  mockFs.restore()
  t.pass('mocks torn down')
})
