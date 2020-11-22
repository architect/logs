let logs = require('.')
let validate = require('./src/validate')
let _inventory = require('@architect/inventory')

let known = 'logs -v --verbose verbose -n --nuke nuke -p --production production prod'.split(' ')
let verboseFlags = '-v --verbose verbose'.split(' ')
let destroyFlags = '-n --destroy destroy'.split(' ')
destroyFlags.concat('-n --nuke nuke'.split(' ')) // Deprecated
let productionFlags = '-p --production production prod'.split(' ')

/**
 * arc logs src/http/get-index ................... gets staging logs
 * arc logs production src/http/get-index ........ gets production logs
 * arc logs destroy src/http/get-index .............. clear staging logs
 * arc logs destroy production src/http/get-index ... clear staging logs
 */
module.exports = async function cli (opts) {
  // Validate for expected env and check for potential creds issues
  validate()

  let inventory = await _inventory({})

  let pathToCode = opts.find(opt => !known.includes(opt))
  let verbose = opts.some(opt => verboseFlags.includes(opt))
  let destroy = opts.some(opt => destroyFlags.includes(opt))
  let production = opts.some(opt => productionFlags.includes(opt))

  return logs({ inventory, pathToCode, verbose, destroy, production })
}
