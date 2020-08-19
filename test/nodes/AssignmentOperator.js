const test = require('ava')
const { AssignmentOperator } = require('../..')

test('it sets a correct type', assert => {
  const node = new AssignmentOperator()
  assert.deepEqual(node.type, 'AssignmentOperator')
})
