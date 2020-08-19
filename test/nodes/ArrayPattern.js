const test = require('ava')
const { ArrayPattern } = require('../..')

test('it sets a correct type', assert => {
  const node = new ArrayPattern()
  assert.deepEqual(node.type, 'ArrayPattern')
})
