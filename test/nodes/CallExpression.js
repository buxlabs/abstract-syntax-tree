const test = require('ava')
const { CallExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new CallExpression()
  assert.deepEqual(node.type, 'CallExpression')
})

test('it accepts options', assert => {
  const node = new CallExpression({
    callee: { type: 'Identifier', name: 'foo' },
    arguments: [
      { type: 'Identifier', name: 'bar' }
    ]
  })
  assert.deepEqual(node.callee.type, 'Identifier')
  assert.deepEqual(node.callee.name, 'foo')
})

test('it works with a shorthand syntax', assert => {
  const node = new CallExpression('foo', ['bar'])
  assert.deepEqual(node.callee.type, 'Identifier')
  assert.deepEqual(node.callee.name, 'foo')
})
