const test = require('ava')
const { Property } = require('../..')

test('it sets a correct type', assert => {
  const node = new Property()
  assert.deepEqual(node.type, 'Property')
})
