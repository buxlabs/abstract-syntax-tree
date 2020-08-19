const test = require('ava')
const { LogicalOperator } = require('../..')

test('it sets a correct type', assert => {
  const node = new LogicalOperator()
  assert.deepEqual(node.type, 'LogicalOperator')
})
