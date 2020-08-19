const test = require('ava')
const { ModuleDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ModuleDeclaration()
  assert.deepEqual(node.type, 'ModuleDeclaration')
})
