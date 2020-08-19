const test = require('ava')
const { ImportSpecifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new ImportSpecifier()
  assert.deepEqual(node.type, 'ImportSpecifier')
})
