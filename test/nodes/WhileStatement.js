const test = require('ava')
const { WhileStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new WhileStatement()
  assert.deepEqual(node.type, 'WhileStatement')
})
