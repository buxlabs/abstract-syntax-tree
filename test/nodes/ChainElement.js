const test = require('ava')
const { ChainElement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ChainElement()
  assert.deepEqual(node.type, 'ChainElement')
})
