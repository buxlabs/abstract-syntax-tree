const test = require('ava')
const { MetaProperty } = require('../..')

test('it sets a correct type', assert => {
  const node = new MetaProperty()
  assert.deepEqual(node.type, 'MetaProperty')
})
