let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')
let getLogicalID = require('./get-logical-id')

module.exports = function readLogs (params, callback) {
  let { aws, inventory, name, pathToCode, ts } = params
  let logicalID = getLogicalID(inventory, pathToCode)

  getPhysicalID({ aws, name, logicalID }, (err, found) => {
    if (err) {
      callback(err)
    }
    else if (!found) {
      pretty.notFound(logicalID)
      callback()
    }
    else {
      let logGroup = '/aws/lambda/' + found
      read({ aws, name: logGroup }, (err, events) => {
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

function read ({ aws, name }, callback) {
  waterfall([

    function describeLogStreams (callback) {
      aws.cloudwatchlogs.DescribeLogStreams({
        logGroupName: name,
        descending: true,
        orderBy: 'LastEventTime',
      })
        .then(data => callback(null, data))
        .catch(err => {
          if (err.code === 'ResourceNotFoundException') {
            pretty.notFound(name)
          }
          callback(err)
        })
    },

    function getLogEvents (result, callback) {
      var names = result.logStreams.map(l => l.logStreamName).reverse()
      parallel(names.map(logStreamName => {
        return function getOneLogEventStream (callback) {
          aws.cloudwatchlogs.GetLogEvents({
            logGroupName: name,
            logStreamName,
          })
            .then(data => callback(null, data))
            .catch(callback)
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
    },
  ], callback)
}
