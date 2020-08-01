const test = require('ava')
const { SourceLocation } = require('../..')

test('it sets a correct type', assert => {
  const node = new SourceLocation()
  assert.deepEqual(node.type, 'SourceLocation')
})
