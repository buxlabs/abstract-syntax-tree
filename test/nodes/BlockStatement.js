const test = require('ava')
const { BlockStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new BlockStatement()
  assert.deepEqual(node.type, 'BlockStatement')
})

test('it sets an empty body', assert => {
  const node = new BlockStatement()
  assert.deepEqual(node.body, [])
})
