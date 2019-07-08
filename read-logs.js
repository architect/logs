let utils = require('@architect/utils')
let aws = require('aws-sdk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let getPhysicalID = require('./get-physical-id')
let pretty = require('./pretty-print')

module.exports = function readLogs({name, pathToCode, ts}, callback) {
  let folder = pathToCode.split('/').filter(Boolean).reverse().shift()
  let logicalID = utils.toLogicalID(folder.replace(/000/g, ''))
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
      let logGroup = '/aws/lambda/' + found
      read(logGroup, function done(err, events) {
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

function read(name, callback) {
  let cloud = new aws.CloudWatchLogs
  waterfall([

    function describeLogStreams(callback) {
      cloud.describeLogStreams({
        logGroupName: name,
        descending: true,
        orderBy: 'LastEventTime'
      }, callback)
    },

    function getLogEvents(result, callback) {
      var names = result.logStreams.map(l=> l.logStreamName).reverse()
      parallel(names.map(logStreamName=> {
        return function getOneLogEventStream(callback) {
          cloud.getLogEvents({
            logGroupName: name,
            logStreamName,
          }, callback)
        }
      }), callback)
    },

    function cleanup(results, callback) {
      if (results.length === 0) {
        callback(null, results)
      }
      else {
        let events = results.map(r=>r.events).reduce((a, b)=> a.concat(b))
        callback(null, events)
      }
    }
  ], callback)
}
