const test = require('ava')
const { TryStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new TryStatement()
  assert.deepEqual(node.type, 'TryStatement')
})
