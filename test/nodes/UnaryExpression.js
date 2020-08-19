const test = require('ava')
const { UnaryExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new UnaryExpression()
  assert.deepEqual(node.type, 'UnaryExpression')
})
