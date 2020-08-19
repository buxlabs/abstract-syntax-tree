const test = require('ava')
const { DoWhileStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new DoWhileStatement()
  assert.deepEqual(node.type, 'DoWhileStatement')
})
