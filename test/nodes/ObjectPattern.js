const test = require('ava')
const { ObjectPattern } = require('../..')

test('it sets a correct type', assert => {
  const node = new ObjectPattern()
  assert.deepEqual(node.type, 'ObjectPattern')
})
