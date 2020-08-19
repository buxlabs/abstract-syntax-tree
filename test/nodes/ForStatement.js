const test = require('ava')
const { ForStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ForStatement()
  assert.deepEqual(node.type, 'ForStatement')
})
