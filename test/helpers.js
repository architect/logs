const fs = require('fs')
const path = require('path')
const os = require('os')

/**
 * Creates a mock inventory object for testing
 * @param {Object} overrides - Properties to override in the default inventory
 * @returns {Object} Mock inventory object
 */
function createMockInventory (overrides = {}) {
  const defaultInventory = {
    inv: {
      app: 'testapp',
      aws: {
        profile: 'default',
        region: 'us-east-1',
      },
      _project: {
        rootHandler: null,
      },
      http: [],
      ws: [],
      lambdaSrcDirs: [],
      customLambdas: [],
    },
  }

  // Deep merge overrides
  const result = {}

  // Copy non-inv properties from overrides
  for (const key in overrides) {
    if (key !== 'inv') {
      result[key] = overrides[key]
    }
  }

  // Merge inv property with deep merge for nested objects
  if (overrides.inv) {
    result.inv = {
      ...defaultInventory.inv,
      ...overrides.inv,
    }

    // Merge nested aws object
    if (overrides.inv.aws) {
      result.inv.aws = {
        ...defaultInventory.inv.aws,
        ...overrides.inv.aws,
      }
    }
    else {
      result.inv.aws = { ...defaultInventory.inv.aws }
    }

    // Merge nested _project object
    if (overrides.inv._project) {
      result.inv._project = {
        ...defaultInventory.inv._project,
        ...overrides.inv._project,
      }
    }
    else {
      result.inv._project = { ...defaultInventory.inv._project }
    }
  }
  else {
    result.inv = defaultInventory.inv
  }

  return result
}

/**
 * Creates a temporary directory, executes a callback with it, and cleans up
 * @param {Function} callback - Function to execute with the temp directory path
 * @returns {*} The return value of the callback
 */
function withTempDir (callback) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'architect-logs-test-'))
  try {
    return callback(tmpDir)
  }
  finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

/**
 * Creates a temporary directory with files and returns the path
 * Useful for mocking filesystem structures in tests
 * @param {Object} fileStructure - Object mapping file paths to contents
 * @returns {string} Path to the temporary directory
 */
function createTempFileStructure (fileStructure = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'architect-logs-test-'))

  for (const [ filePath, content ] of Object.entries(fileStructure)) {
    const fullPath = path.join(tmpDir, filePath)
    const dir = path.dirname(fullPath)

    // Create directory structure if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Write file content
    fs.writeFileSync(fullPath, content, 'utf8')
  }

  return tmpDir
}

/**
 * Cleans up a temporary directory created by createTempFileStructure
 * @param {string} tmpDir - Path to the temporary directory to remove
 */
function cleanupTempDir (tmpDir) {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

module.exports = {
  createMockInventory,
  withTempDir,
  createTempFileStructure,
  cleanupTempDir,
}
