const test = require('ava')
const { Literal } = require('../..')

test('it sets a correct type', assert => {
  const node = new Literal()
  assert.deepEqual(node.type, 'Literal')
})

test('it assigns additional properties', assert => {
  const node = new Literal({ value: 'foo' })
  assert.deepEqual(node.value, 'foo')
})

test('it supports a shorthand syntax', assert => {
  const node = new Literal('foo')
  assert.deepEqual(node.value, 'foo')
})
