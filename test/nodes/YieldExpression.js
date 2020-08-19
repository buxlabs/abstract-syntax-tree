const test = require('ava')
const { YieldExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new YieldExpression()
  assert.deepEqual(node.type, 'YieldExpression')
})
