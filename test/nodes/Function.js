const test = require('ava')
const { Function } = require('../..')

test('it sets a correct type', assert => {
  const node = new Function()
  assert.deepEqual(node.type, 'Function')
})

test('it sets defaults', assert => {
  const node = new Function({ name: 'foo' })
  assert.deepEqual(node.generator, false)
})
