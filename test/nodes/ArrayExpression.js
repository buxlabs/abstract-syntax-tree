const test = require('ava')
const { ArrayExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ArrayExpression()
  assert.deepEqual(node.type, 'ArrayExpression')
})
