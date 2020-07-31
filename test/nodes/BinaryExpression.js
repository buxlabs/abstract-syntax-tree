const test = require('ava')
const { BinaryExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new BinaryExpression()
  assert.deepEqual(node.type, 'BinaryExpression')
})

test('it assigns additional properties', assert => {
  const node = new BinaryExpression({
    left: { type: 'Identifier', name: 'foo' },
    right: { type: 'Identifier', name: 'bar' },
    operator: '==='
  })
  assert.deepEqual(node.operator, '===')
})
