const test = require('ava')
const { BinaryOperator } = require('../..')

test('it sets a correct type', assert => {
  const node = new BinaryOperator()
  assert.deepEqual(node.type, 'BinaryOperator')
})
