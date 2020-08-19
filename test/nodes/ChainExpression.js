const test = require('ava')
const { ChainExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ChainExpression()
  assert.deepEqual(node.type, 'ChainExpression')
})
