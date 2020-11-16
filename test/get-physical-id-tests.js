let test = require('tape')
const AWS = require('aws-sdk-mock')
const sinon = require('sinon')
let resourceStub = { StackResourceSummaries: [] }
let fake = sinon.fake.yields(null, resourceStub)
AWS.mock('CloudFormation', 'listStackResources', fake)
let getPhysicalID = require('../src/get-physical-id')

test('should return only return Lambda Function resource types', t => {
  t.plan(1)
  resourceStub.StackResourceSummaries = [
    { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'lambda', PhysicalResourceId: 'one' },
    { ResourceType: 'AWS::Lambda::NotAFunction', LogicalResourceId: 'lambda', PhysicalResourceId: 'two' }
  ]
  getPhysicalID({ name: 'stackname', logicalID: 'lambda' }, function (err, id) {
    if (err) t.fail('unexpected error in callback')
    else t.equals(id, 'one')
  })
})

test('should be able to paginate through multiple pages of results from CloudFormation', t => {
  t.plan(1)
  let pagefake = sinon.fake(function (params, callback) {
    if (params.NextToken) {
      resourceStub.StackResourceSummaries = [
        { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'gamma', PhysicalResourceId: 'four' }
      ]
    }
    else {
      resourceStub.StackResourceSummaries = [
        { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'alpha', PhysicalResourceId: 'one' },
        { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'beta', PhysicalResourceId: 'two' },
        { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'delta', PhysicalResourceId: 'three' }
      ]
      resourceStub.NextToken = '123'
    }
    callback(null, resourceStub)
  })
  AWS.remock('CloudFormation', 'listStackResources', pagefake)
  getPhysicalID({ name: 'stackname', logicalID: 'gamma' }, function (err, id) {
    if (err) t.fail('unexpected error in callback', err)
    else t.equals(id, 'four')
    AWS.restore()
  })
})
