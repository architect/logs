let { updater } = require('@architect/utils')
let update = updater('Logs')

module.exports = function validate () {
  if (process.env.ARC_AWS_CREDS === 'missing') {
    update.error('Failed to access logs: missing or invalid AWS credentials or credentials file')
    process.exit(1)
  }
}
