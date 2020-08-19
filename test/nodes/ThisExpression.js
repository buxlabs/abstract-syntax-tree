const test = require('ava')
const { ThisExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ThisExpression()
  assert.deepEqual(node.type, 'ThisExpression')
})
