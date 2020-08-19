const test = require('ava')
const { FunctionBody } = require('../..')

test('it sets a correct type', assert => {
  const node = new FunctionBody()
  assert.deepEqual(node.type, 'FunctionBody')
})
