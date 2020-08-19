const test = require('ava')
const { UnaryOperator } = require('../..')

test('it sets a correct type', assert => {
  const node = new UnaryOperator()
  assert.deepEqual(node.type, 'UnaryOperator')
})
