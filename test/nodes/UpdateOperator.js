const test = require('ava')
const { UpdateOperator } = require('../..')

test('it sets a correct type', assert => {
  const node = new UpdateOperator()
  assert.deepEqual(node.type, 'UpdateOperator')
})
