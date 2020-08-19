const test = require('ava')
const { ContinueStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ContinueStatement()
  assert.deepEqual(node.type, 'ContinueStatement')
})
