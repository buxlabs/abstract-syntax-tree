const test = require('ava')
const { ClassExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ClassExpression()
  assert.deepEqual(node.type, 'ClassExpression')
})
