const test = require('ava')
const { MethodDefinition } = require('../..')

test('it sets a correct type', assert => {
  const node = new MethodDefinition()
  assert.deepEqual(node.type, 'MethodDefinition')
})
