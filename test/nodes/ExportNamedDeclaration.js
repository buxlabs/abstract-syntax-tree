const test = require('ava')
const { ExportNamedDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ExportNamedDeclaration()
  assert.deepEqual(node.type, 'ExportNamedDeclaration')
})
