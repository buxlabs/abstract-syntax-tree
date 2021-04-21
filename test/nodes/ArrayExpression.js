const test = require('ava')
const { ArrayExpression, Literal } = require('../..')

test('it sets a correct type', assert => {
  const node = new ArrayExpression()
  assert.deepEqual(node.type, 'ArrayExpression')
})

test('it accepts options', assert => {
  const node = new ArrayExpression({
    elements: [
      new Literal('foo')
    ]
  })
  assert.deepEqual(node.type, 'ArrayExpression')
  assert.deepEqual(node.elements, [new Literal('foo')])
})

test('it supports a shorthand syntax', assert => {
  const node = new ArrayExpression([
    new Literal('foo')
  ])
  assert.deepEqual(node.type, 'ArrayExpression')
  assert.deepEqual(node.elements, [new Literal('foo')])
})
