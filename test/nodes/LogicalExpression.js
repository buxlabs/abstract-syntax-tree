const test = require('ava')
const { LogicalExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new LogicalExpression()
  assert.deepEqual(node.type, 'LogicalExpression')
})
