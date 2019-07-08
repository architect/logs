let aws = require('aws-sdk')

/**
 * get the physical id of a lambda function
 *
 * @param {String} params.name - cloudformation stack name
 * @param {String} params.pathToCode - path to lambda code
 * @param {logicalID} params.logicalID - the logical id of the function
 */
module.exports = function getPhysicalID({name, logicalID}, callback) {
  let cloudformation = new aws.CloudFormation
  cloudformation.listStackResources({
    StackName: name
  },
  function done(err, data) {
    if (err) callback(err)
    else {
      let find = i=> i.ResourceType === 'AWS::Lambda::Function'
      let functions = data.StackResourceSummaries.filter(find)
      let found = functions.find(f=> f.LogicalResourceId === logicalID)
      if (found) callback(null, found.PhysicalResourceId)
      else callback()
    }
  })
}
