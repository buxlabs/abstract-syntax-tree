const test = require('ava')
const { SpreadElement } = require('../..')

test('it sets a correct type', assert => {
  const node = new SpreadElement()
  assert.deepEqual(node.type, 'SpreadElement')
})
