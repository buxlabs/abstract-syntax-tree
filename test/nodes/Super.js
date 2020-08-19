const test = require('ava')
const { Super } = require('../..')

test('it sets a correct type', assert => {
  const node = new Super()
  assert.deepEqual(node.type, 'Super')
})
