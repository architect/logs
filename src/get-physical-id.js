/**
 * get the physical id of a lambda function
 *
 * @param {String} params.name - cloudformation stack name
 * @param {String} params.pathToCode - path to lambda code
 * @param {logicalID} params.logicalID - the logical id of the function
 */
module.exports = function getPhysicalID ({ aws, name, logicalID }, callback) {
  aws.cloudformation.ListStackResources({
    StackName: name,
    paginate: true,
  })
    .then(data => {
      let find = i => i.ResourceType === 'AWS::Lambda::Function'
      let functions = data.StackResourceSummaries.filter(find)
      let found = functions.find(f => f.LogicalResourceId === logicalID)
      if (found) callback(null, found.PhysicalResourceId)
      else callback()
    })
    .catch(callback)
}
