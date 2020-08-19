const test = require('ava')
const { ObjectExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ObjectExpression()
  assert.deepEqual(node.type, 'ObjectExpression')
})
