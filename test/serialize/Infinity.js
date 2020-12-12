const test = require('ava')
const { serialize } = require('../..')

test('serialize: Infinity', assert => {
  assert.deepEqual(serialize({ type: 'Identifier', name: 'Infinity' }), Infinity)
})
