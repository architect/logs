let aws = require('aws-sdk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')
let getLogicalID = require('./get-logical-id')

module.exports = function readLogs (params, callback) {
  let { inventory, name, pathToCode, ts } = params
  let { region } = inventory.inv.aws
  let logicalID = getLogicalID(inventory, pathToCode)

  getPhysicalID({
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
      let logGroup = '/aws/lambda/' + found
      read({ name: logGroup, region }, function done (err, events) {
        if (err) callback(err)
        else {
          pretty.printLogs(events)
          pretty.success(ts)
          callback()
        }
      })
    }
  })
}

function read ({ name, region }, callback) {
  let cloud = new aws.CloudWatchLogs({ region })
  waterfall([

    function describeLogStreams (callback) {
      cloud.describeLogStreams({
        logGroupName: name,
        descending: true,
        orderBy: 'LastEventTime'
      }, callback)
    },

    function getLogEvents (result, callback) {
      var names = result.logStreams.map(l => l.logStreamName).reverse()
      parallel(names.map(logStreamName => {
        return function getOneLogEventStream (callback) {
          cloud.getLogEvents({
            logGroupName: name,
            logStreamName,
          }, callback)
        }
      }), callback)
    },

    function cleanup (results, callback) {
      if (results.length === 0) {
        callback(null, results)
      }
      else {
        let events = results.map(r => r.events).reduce((a, b) => a.concat(b))
        callback(null, events)
      }
    }
  ], callback)
}
