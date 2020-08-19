const test = require('ava')
const { Declaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new Declaration()
  assert.deepEqual(node.type, 'Declaration')
})
