const test = require('ava')
const { ImportNamespaceSpecifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new ImportNamespaceSpecifier()
  assert.deepEqual(node.type, 'ImportNamespaceSpecifier')
})
