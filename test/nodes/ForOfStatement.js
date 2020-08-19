const test = require('ava')
const { ForOfStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ForOfStatement()
  assert.deepEqual(node.type, 'ForOfStatement')
})
