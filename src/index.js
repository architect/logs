let fs = require('fs')
let utils = require('@architect/utils')
let awsLite = require('@aws-lite/client')
let { join } = require('path')
let pretty = require('./pretty-print')
let destroy = require('./destroy-logs')
let read = require('./read-logs')
let cwd = process.cwd()

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
  let { inventory, pathToCode, verbose, destroy, production } = params

  let promise
  if (!callback) {
    promise = new Promise(function ugh (res, rej) {
      callback = function errback (err, result) {
        if (err) rej(err)
        else res(result)
      }
    })
  }

  let ts = Date.now()
  let rootHandler = inventory.inv._project.rootHandler
  if (!pathToCode && rootHandler) {
    let handler = inventory.inv.http.find(({ name }) => name === rootHandler)
    pathToCode = handler.src
    let update = utils.updater('Logs')
    update.status(`No Lambda specified; using root @http handler (${rootHandler})`)
  }
  let dir = pathToCode?.startsWith(cwd) ? pathToCode : join(cwd, pathToCode)
  let exists = (typeof pathToCode !== 'undefined' && fs.existsSync(dir))

  let appname = inventory.inv.app
  let name = `${utils.toLogicalID(appname)}${production ? 'Production' : 'Staging'}`

  if (!exists) {
    pretty.notFound(pathToCode)
  }
  else {
    awsLite({
      profile: inventory.inv.aws.profile,
      region: inventory.inv.aws.region,
      plugins: [
        import('@aws-lite/cloudformation'),
        import('@aws-lite/cloudwatch-logs'),
      ],
    })
      .then(aws => {
        let args = { aws, inventory, ts, name, pathToCode, verbose }
        // TODO refactor sinon out so we don't have to call module.exports methods
        if (destroy) module.exports.destroy(args, callback)
        else module.exports.read(args, callback)
      })
  }

  return promise
}

module.exports.destroy = destroy
module.exports.read = read
