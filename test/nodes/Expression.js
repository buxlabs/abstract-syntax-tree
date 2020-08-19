const test = require('ava')
const { Expression } = require('../..')

test('it sets a correct type', assert => {
  const node = new Expression()
  assert.deepEqual(node.type, 'Expression')
})
