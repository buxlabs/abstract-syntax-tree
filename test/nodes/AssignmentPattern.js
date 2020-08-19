const test = require('ava')
const { AssignmentPattern } = require('../..')

test('it sets a correct type', assert => {
  const node = new AssignmentPattern()
  assert.deepEqual(node.type, 'AssignmentPattern')
})
