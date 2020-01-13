let utils = require('@architect/utils')

module.exports = function getLogicalID (pathToCode) {
  let folder = pathToCode.split('/').filter(Boolean).reverse().shift()
  let logicalID = utils.toLogicalID(folder.replace(/000/g, ''))

  if (pathToCode.includes('/ws/')) {
    // Websocket logical ids are prefixed with "Websocket"
    logicalID = "Websocket" + logicalID
  }

  return logicalID
}
