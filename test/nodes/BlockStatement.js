const test = require('ava')
const { BlockStatement, Literal } = require('../..')

test('it sets a correct type', assert => {
  const node = new BlockStatement()
  assert.deepEqual(node.type, 'BlockStatement')
})

test('it sets an empty body', assert => {
  const node = new BlockStatement()
  assert.deepEqual(node.body, [])
})

test('it accepts options', assert => {
  const node = new BlockStatement({ body: [new Literal({ value: 'foo' })] })
  assert.deepEqual(node.body[0].type, 'Literal')
  assert.deepEqual(node.body[0].value, 'foo')
})
