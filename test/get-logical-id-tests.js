const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const _inventory = require('@architect/inventory')
const { sep, join } = require('path')
const { createTempFileStructure, cleanupTempDir } = require('./helpers')
const getLogicalID = require('../src/get-logical-id')

describe('get-logical-id', () => {
  let inventory
  let tmpDir
  let originalCwd

  before(async () => {
    // Save original cwd
    originalCwd = process.cwd()

    // Create temporary directory with plugin structure
    const fakePluginPath = join('src', 'plugins', 'myplugin.js')
    const pluginContent = `module.exports = {
  set: {
    customLambdas: () => {
      return {
        name: 'a-custom-lambda',
        src: 'src/myplugin/custom-funk',
      }
    },
  },
}`

    tmpDir = createTempFileStructure({
      [fakePluginPath]: pluginContent,
      [join('src', 'myplugin', 'custom-funk', 'index.js')]: '// custom lambda',
      [join('src', 'http', 'get-index', 'index.js')]: '// http lambda',
      [join('src', 'http', 'get-api-000version', 'index.js')]: '// http lambda with param',
      [join('src', 'ws', 'default', 'index.js')]: '// websocket lambda',
    })

    // Change to temp directory
    process.chdir(tmpDir)

    // Create inventory
    const rawArc = '@app\nappname\n@http\nget /\nget /api/:version\n@ws\n@plugins\nmyplugin\n@myplugin\ncustom-funk'

    return new Promise((resolve, reject) => {
      _inventory({ cwd: tmpDir, rawArc }, (err, result) => {
        if (err) reject(err)
        else {
          inventory = result
          resolve()
        }
      })
    })
  })

  after(() => {
    // Restore original cwd
    process.chdir(originalCwd)
    // Clean up temp directory
    cleanupTempDir(tmpDir)
  })

  it('should have getLogicalID module', () => {
    assert.ok(getLogicalID, 'Logical ID module is present')
  })

  it('should return logical id for http path', () => {
    const id = getLogicalID(inventory, `.${sep}src${sep}http${sep}get-index`)
    assert.strictEqual(id, 'GetIndexHTTPLambda')
  })

  it('should return logical id for websocket path', () => {
    const id = getLogicalID(inventory, `.${sep}src${sep}ws${sep}default`)
    assert.strictEqual(id, 'DefaultWSLambda')
  })

  it('should replace references to 000 in path', () => {
    const id = getLogicalID(inventory, `.${sep}src${sep}http${sep}get-api-000version`)
    assert.strictEqual(id, 'GetApiVersionHTTPLambda')
  })

  it('should throw on unknown path', () => {
    assert.throws(() => {
      getLogicalID(inventory, `.${sep}src${sep}http${sep}idk`)
    }, ReferenceError, 'Threw on unknown path')
  })

  it('should include name for custom Lambdas based on the path and contain a CustomLambda suffix', () => {
    const id = getLogicalID(inventory, `.${sep}src${sep}myplugin${sep}custom-funk`)
    assert.strictEqual(id, 'ACustomLambdaCustomLambda')
  })
})
