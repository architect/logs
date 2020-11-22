let aws = require('aws-sdk')
let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')
let getLogicalID = require('./get-logical-id')

module.exports = function destroyLogs (params, callback) {
  let { inventory, name, pathToCode, ts } = params
  let cloud = new aws.CloudWatchLogs({ region: process.env.AWS_REGION })
  let logicalID = getLogicalID(inventory, pathToCode)

  getPhysicalID({
    name,
    logicalID
  },
  function done (err, found) {
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
      function done (err) {
        if (err) callback(err)
        else {
          pretty.success(ts)
          callback()
        }
      })
    }
  })
}
