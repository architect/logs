let chalk = require('chalk')
let strftime = require('strftime')

module.exports = {

  success (ts) {
    let check = chalk.green('✓')
    let msg = chalk.grey('Logs')
    let time = chalk.green.bold((Date.now() - ts) / 1000 + ' seconds')
    console.log(check, msg, time)
  },

  notFound (pathToCode) {
    let red = chalk.bgRed.bold.white
    let yel = chalk.yellow
    console.log(red('Not found!'), yel('Cannot find logs for ' + pathToCode))
  },

  printLogs (events) {
    // chronological (most recent at end of output)
    let sort = (a, b) => (new Date(a.timestamp) - new Date(b.timestamp))
    events.sort(sort).forEach(event => {
      // make the timestamp friendly to read
      // let left = new Date(event.timestamp).toISOString().replace(/T|Z/g, ' ').trim()
      let left = strftime('%b %d, %r', new Date(event.timestamp))
      // parse out the cloudwatch messages
      let right = event.message.replace(/(^\n|\n$)/g, '').split('\t').splice(2)

      // if there are any messages print
      if (right.length != 0) {
        // print the timestamp
        console.log(chalk.cyan(left))
        // filter empties, walk each message
        right.filter(Boolean).forEach(item => {
          // check for an error
          let isErr = /error/gi.test(item)
          let color = isErr ? chalk.bold.red : chalk.grey
          // try to parse json logs
          try {
            let json = JSON.parse(item.trim())
            if (json.errorMessage && json.errorType && json.stackTrace) {
              let str = (' ' + json.errorType + ': ' + json.errorMessage + ' ').padEnd(left.length)
              console.log(chalk.bgRed.white.bold(str))
              console.log(chalk.bgBlack.yellow(json.stackTrace.join('\n')))
            }
            else {
              console.log(color(JSON.stringify(json, null, 2)))
            }
          }
          catch (e) {
            // not json, just print
            console.log(color(item.trim()))
          }
        })
        console.log(' ')
      }
    })
  }
}
