const { describe, it, after } = require('node:test')
const assert = require('node:assert/strict')
const getPhysicalID = require('../src/get-physical-id')

describe('getPhysicalID', () => {
  after(() => {
    // Cleanup if needed
  })

  it('should return only Lambda Function resource types', (t, done) => {
    const mockAws = {
      cloudformation: {
        ListStackResources: ({ StackName, paginate }) => {
          assert.strictEqual(StackName, 'stackname', 'Stack name passed correctly')
          assert.strictEqual(paginate, true, 'Paginate flag set to true')

          return Promise.resolve({
            StackResourceSummaries: [
              { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'lambda', PhysicalResourceId: 'one' },
              { ResourceType: 'AWS::Lambda::NotAFunction', LogicalResourceId: 'lambda', PhysicalResourceId: 'two' },
            ],
          })
        },
      },
    }

    getPhysicalID({ aws: mockAws, name: 'stackname', logicalID: 'lambda' }, (err, id) => {
      assert.ifError(err, 'No error in callback')
      assert.strictEqual(id, 'one', 'Returns correct physical ID for Lambda function')
      done()
    })
  })

  it('should be able to paginate through multiple pages of results from CloudFormation', (t, done) => {
    const mockAws = {
      cloudformation: {
        ListStackResources: ({ StackName, paginate }) => {
          assert.strictEqual(StackName, 'stackname', 'Stack name passed correctly')
          assert.strictEqual(paginate, true, 'Paginate flag set to true')

          // Simulate pagination by returning all results at once
          // (aws-lite handles pagination internally)
          return Promise.resolve({
            StackResourceSummaries: [
              { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'alpha', PhysicalResourceId: 'one' },
              { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'beta', PhysicalResourceId: 'two' },
              { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'delta', PhysicalResourceId: 'three' },
              { ResourceType: 'AWS::Lambda::Function', LogicalResourceId: 'gamma', PhysicalResourceId: 'four' },
            ],
          })
        },
      },
    }

    getPhysicalID({ aws: mockAws, name: 'stackname', logicalID: 'gamma' }, (err, id) => {
      assert.ifError(err, 'No error in callback')
      assert.strictEqual(id, 'four', 'Returns correct physical ID from paginated results')
      done()
    })
  })
})
