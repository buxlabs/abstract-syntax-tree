const test = require('ava')
const { ExportDefaultDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ExportDefaultDeclaration()
  assert.deepEqual(node.type, 'ExportDefaultDeclaration')
})
