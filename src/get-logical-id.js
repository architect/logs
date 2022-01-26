let { sep } = require('path')
let { getLambdaName, toLogicalID } = require('@architect/utils')

module.exports = function getLogicalID (inventory, dir) {
  let pathToCode = dir.endsWith(sep) ? dir.substr(0, dir.length - 1) : dir
  pathToCode = pathToCode.replace(process.cwd(), '').replace(/^\.?\/?\\?/, '')

  let { inv } = inventory
  let dirs = inv.lambdaSrcDirs
  if (!dirs.some(d => d.endsWith(pathToCode))) throw ReferenceError(`Unable to find Lambda for ${pathToCode}`)

  let lambda
  let lambdae = {
    events: 'Event',
    http: 'HTTP',
    queues: 'Queue',
    scheduled: 'Scheduled',
    streams: 'Stream',
    ws: 'WS',
    customLambdas: 'Custom',
  }
  Object.entries(lambdae).forEach(([ pragma, type ]) => {
    if (lambda) return
    if (inv[pragma]) inv[pragma].forEach(l => {
      if (l.src.endsWith(pathToCode)) lambda = { ...l, type }
    })
  })

  if (lambda) {
    let { name, type } = lambda
    if (type === 'HTTP') {
      let lambdaName = getLambdaName(lambda.path)
      let id = toLogicalID(`${lambda.method}${lambdaName.replace(/000/g, '')}`)
      return `${id}HTTPLambda`
    }
    else {
      let lambdaName = getLambdaName(name)
      let id = toLogicalID(lambdaName)
      return `${id}${type}Lambda`
    }
  }
}
