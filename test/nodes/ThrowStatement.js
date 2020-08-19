const test = require('ava')
const { ThrowStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ThrowStatement()
  assert.deepEqual(node.type, 'ThrowStatement')
})
