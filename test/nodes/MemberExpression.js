const test = require('ava')
const { MemberExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new MemberExpression()
  assert.deepEqual(node.type, 'MemberExpression')
})

test('it sets computed to false', assert => {
  const node = new MemberExpression()
  assert.deepEqual(node.computed, false)
})
