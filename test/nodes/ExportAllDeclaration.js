const test = require('ava')
const { ExportAllDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ExportAllDeclaration()
  assert.deepEqual(node.type, 'ExportAllDeclaration')
})
