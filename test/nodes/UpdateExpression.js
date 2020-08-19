const test = require('ava')
const { UpdateExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new UpdateExpression()
  assert.deepEqual(node.type, 'UpdateExpression')
})
