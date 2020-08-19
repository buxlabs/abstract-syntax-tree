const test = require('ava')
const { ReturnStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ReturnStatement()
  assert.deepEqual(node.type, 'ReturnStatement')
})
