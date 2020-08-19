const test = require('ava')
const { SequenceExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new SequenceExpression()
  assert.deepEqual(node.type, 'SequenceExpression')
})
