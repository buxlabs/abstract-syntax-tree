const test = require('ava')
const { ImportDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ImportDeclaration()
  assert.deepEqual(node.type, 'ImportDeclaration')
})
