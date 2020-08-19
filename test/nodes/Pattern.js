const test = require('ava')
const { Pattern } = require('../..')

test('it sets a correct type', assert => {
  const node = new Pattern()
  assert.deepEqual(node.type, 'Pattern')
})
