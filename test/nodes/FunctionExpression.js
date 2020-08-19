const test = require('ava')
const { FunctionExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new FunctionExpression()
  assert.deepEqual(node.type, 'FunctionExpression')
})
