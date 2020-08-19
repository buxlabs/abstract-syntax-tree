const test = require('ava')
const { ModuleSpecifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new ModuleSpecifier()
  assert.deepEqual(node.type, 'ModuleSpecifier')
})
