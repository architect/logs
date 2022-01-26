let test = require('tape')
let mockFs = require('mock-fs')
let mockRequire = require('mock-require')
let _inventory = require('@architect/inventory')
let { sep, join } = require('path')
let getLogicalID = require('../src/get-logical-id')
let inventory

function setUp () {
  let fakePluginPath = join(process.cwd(), 'src', 'plugins', 'myplugin.js')
  // because mock-fs forces you to use / even on windows :| :| :|
  let unixFakePluginPath = fakePluginPath.replace(/\\/g, '/')
  let mocks = {}
  mocks[unixFakePluginPath] = 'fake file contents'
  mockRequire(fakePluginPath, {
    set: {
      customLambdas: () => {
        return {
          name: 'a-custom-lambda',
          src: join(process.cwd(), 'src', 'myplugin', 'custom-funk')
        }
      }
    }
  })
  mockFs(mocks)
}

function tearDown () {
  mockFs.restore()
  mockRequire.stopAll()
}

test('Set up env', t => {
  t.plan(2)
  setUp()
  let rawArc = '@app\nappname\n@http\nget /\nget /api/:version\n@ws\n@plugins\nmyplugin\n@myplugin\ncustom-funk'
  _inventory({ rawArc }, (err, result) => {
    if (err) t.fail(err)
    else {
      inventory = result
      t.ok(getLogicalID, 'Logical ID module is present')
      t.pass('Got inventory')
      tearDown()
    }
  })
})

test('get-logical-id should return logical id for path', t => {
  t.plan(1)
  setUp()
  let id = getLogicalID(inventory, `.${sep}src${sep}http${sep}get-index`)
  t.equal(id, 'GetIndexHTTPLambda')
  tearDown()
})

test('get-logical-id should return logical id for websocket path', t => {
  t.plan(1)
  setUp()
  let id = getLogicalID(inventory, `.${sep}src${sep}ws${sep}default`)
  t.equal(id, 'DefaultWSLambda')
  tearDown()
})

test('get-logical-id should replace references to 000 in path', t => {
  t.plan(1)
  setUp()
  let id = getLogicalID(inventory, `.${sep}src${sep}http${sep}get-api-000version`)
  t.equal(id, 'GetApiVersionHTTPLambda')
  tearDown()
})

test('get-logical-id should blow up on unknown path', t => {
  t.plan(1)
  t.throws(() => {
    getLogicalID(inventory, `.${sep}src${sep}http${sep}idk`)
  }, 'Threw on unknown path')
})

test('get-logical-id should include name custom Lambdas based on the path and contain a CustomLambda suffix', t => {
  t.plan(1)
  setUp()
  let id = getLogicalID(inventory, `.${sep}src${sep}myplugin${sep}custom-funk`)
  t.equal(id, 'ACustomLambdaCustomLambda')
  tearDown()
})
