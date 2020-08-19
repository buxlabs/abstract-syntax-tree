const test = require('ava')
const { NewExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new NewExpression()
  assert.deepEqual(node.type, 'NewExpression')
})
