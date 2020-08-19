const test = require('ava')
const { AssignmentExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new AssignmentExpression()
  assert.deepEqual(node.type, 'AssignmentExpression')
})
