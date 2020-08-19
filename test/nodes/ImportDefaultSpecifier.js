const test = require('ava')
const { ImportDefaultSpecifier } = require('../..')

test('it sets a correct type', assert => {
  const node = new ImportDefaultSpecifier()
  assert.deepEqual(node.type, 'ImportDefaultSpecifier')
})
