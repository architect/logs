let utils = require('@architect/utils')
let aws = require('aws-sdk')
let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')

module.exports = function nukeLogs({name, pathToCode, ts}, callback) {
  let cloud = new aws.CloudWatchLogs
  let folder = pathToCode.split('/').filter(Boolean).reverse().shift()
  let logicalID = utils.toLogicalID(folder)
  getPhysicalID({
    name,
    logicalID
  },
  function done(err, found) {
    if (err) {
      callback(err)
    }
    else if (!found) {
      pretty.notFound(logicalID)
      callback()
    }
    else {
      cloud.deleteLogGroup({
        logGroupName: '/aws/lambda/' + found
      },
      function done(err) {
        if (err) callback(err)
        else {
          pretty.success(ts)
          callback()
        }
      })
    }
  })
}
