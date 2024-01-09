let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')
let getLogicalID = require('./get-logical-id')

module.exports = function destroyLogs (params, callback) {
  let { aws, inventory, name, pathToCode, ts } = params
  let { region } = inventory.inv.aws
  let logicalID = getLogicalID(inventory, pathToCode)

  getPhysicalID({
    aws,
    name,
    logicalID,
    region,
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
      let logGroupName = '/aws/lambda/' + found
      aws.cloudwatchlogs.DeleteLogGroup({ logGroupName })
        .then(() => {
          pretty.success(ts)
          callback()
        })
        .catch(err => {
          if (err.code === 'ResourceNotFoundException' &&
              err.message.includes('The specified log group does not exist')) {
            pretty.notFound(logGroupName)
          }
          else callback(err)
        })
    }
  })
}
