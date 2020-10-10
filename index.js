let fs = require('fs')
let utils = require('@architect/utils')
let path = require('path')
let pretty = require('./src/pretty-print')
let nukeLogs = require('./src/nuke-logs')
let readLogs = require('./src/read-logs')

/**
 * arc logs src/http/get-index ................... gets staging logs
 * arc logs production src/http/get-index ........ gets production logs
 * arc logs nuke src/http/get-index .............. clear staging logs
 * arc logs nuke production src/http/get-index ... clear staging logs
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
  let { pathToCode, verbose, nuke, production } = params

  // flags
  let ts = Date.now()
  let exists = (typeof pathToCode != 'undefined' && fs.existsSync(path.join(process.cwd(), pathToCode)))

  // config
  let { arc } = utils.readArc()
  let appname = arc.app[0]
  let name = `${utils.toLogicalID(appname)}${production ? 'Production' : 'Staging'}`

  // flow
  if (!exists) {
    pretty.notFound(pathToCode)
  }
  else if (nuke) {
    module.exports.nuke({
      ts,
      name,
      pathToCode,
      verbose,
    }, callback)
  }
  else {
    module.exports.read({
      ts,
      name,
      pathToCode,
      verbose,
    }, callback)
  }

  return promise
}

module.exports.nuke = nukeLogs
module.exports.read = readLogs
