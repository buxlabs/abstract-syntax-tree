const test = require('ava')
const { AwaitExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new AwaitExpression()
  assert.deepEqual(node.type, 'AwaitExpression')
})
