let fs = require('fs')
let utils = require('@architect/utils')
let { join } = require('path')
let pretty = require('./pretty-print')
let destroyLogs = require('./destroy-logs')
let readLogs = require('./read-logs')

/**
 * arc logs src/http/get-index ................... gets staging logs
 * arc logs production src/http/get-index ........ gets production logs
 * arc logs destroy src/http/get-index .............. clear staging logs
 * arc logs destroy production src/http/get-index ... clear staging logs
 *
 * @param {Array} opts - option arguments
 * @param {Function} callback - a node-style errback
 * @returns {Promise} - if no callback is supplied
 */
module.exports = function logs (params = {}, callback) {
  let promise
  if (!callback) {
    promise = new Promise(function ugh (res, rej) {
      callback = function errback (err, result) {
        if (err) rej(err)
        else res(result)
      }
    })
  }
  let { inventory, pathToCode, verbose, destroy, production } = params

  // flags
  let ts = Date.now()
  let exists = (typeof pathToCode !== 'undefined' && fs.existsSync(join(process.cwd(), pathToCode)))

  // config
  let appname = inventory.inv.app
  let name = `${utils.toLogicalID(appname)}${production ? 'Production' : 'Staging'}`

  // flow
  if (!exists) {
    pretty.notFound(pathToCode)
  }
  else if (destroy) {
    module.exports.destroy({
      inventory,
      ts,
      name,
      pathToCode,
      verbose,
    }, callback)
  }
  else {
    module.exports.read({
      inventory,
      ts,
      name,
      pathToCode,
      verbose,
    }, callback)
  }

  return promise
}

module.exports.destroy = destroyLogs
module.exports.read = readLogs
