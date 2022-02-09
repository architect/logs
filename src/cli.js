#!/usr/bin/env node
let minimist = require('minimist')
let { banner } = require('@architect/utils')
let _inventory = require('@architect/inventory')
let { version } = require('../package.json')
let validate = require('./validate')
let logs = require('.')

/**
 * arc logs src/http/get-index ................... gets staging logs
 * arc logs production src/http/get-index ........ gets production logs
 * arc logs destroy src/http/get-index .............. clear staging logs
 * arc logs destroy production src/http/get-index ... clear staging logs
 */
async function main (opts = {}) {
  let { inventory } = opts

  // Validate for expected env and check for potential creds issues
  validate()

  if (!inventory) inventory = await _inventory({})

  let alias = {
    production: [ 'p' ],
    debug:      [ 'd' ],
    verbose:    [ 'v' ],
  }
  let boolean = [ 'debug', 'destroy', 'production', 'verbose' ]
  let args = minimist(process.argv.slice(2), { alias, boolean })
  if (args._[0] === 'logs') args._.splice(0, 1)

  return logs({ inventory, pathToCode: args._[0], ...args })
}

module.exports = main

if (require.main === module) {
  (async function () {
    try {
      let inventory = await _inventory({})
      banner({ inventory, version: `Logs ${version}` })
      await main({ inventory })
    }
    catch (err) {
      console.log(err)
    }
  })()
}
