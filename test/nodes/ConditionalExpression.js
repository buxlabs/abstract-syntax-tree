const test = require('ava')
const { ConditionalExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ConditionalExpression()
  assert.deepEqual(node.type, 'ConditionalExpression')
})
