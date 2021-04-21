const test = require('ava')
const { Identifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new Identifier()
  assert.deepEqual(node.type, 'Identifier')
})

test('it assigns additional properties', assert => {
  const node = new Identifier({ name: 'foo' })
  assert.deepEqual(node.name, 'foo')
})

test('it supports a shorthand syntax', assert => {
  const node = new Identifier('foo')
  assert.deepEqual(node.name, 'foo')
})
