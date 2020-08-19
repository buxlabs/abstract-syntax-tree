const test = require('ava')
const { RestElement } = require('../..')

test('it sets a correct type', assert => {
  const node = new RestElement()
  assert.deepEqual(node.type, 'RestElement')
})
