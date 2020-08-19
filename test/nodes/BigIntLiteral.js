const test = require('ava')
const { BigIntLiteral } = require('../..')

test('it sets a correct type', assert => {
  const node = new BigIntLiteral()
  assert.deepEqual(node.type, 'BigIntLiteral')
})
