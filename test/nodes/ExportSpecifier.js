const test = require('ava')
const { ExportSpecifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new ExportSpecifier()
  assert.deepEqual(node.type, 'ExportSpecifier')
})
