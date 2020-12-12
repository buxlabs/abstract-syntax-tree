const test = require('ava')
const { serialize } = require('../..')

test('serialize: Undefined', assert => {
  assert.deepEqual(serialize({ type: 'Identifier', name: 'undefined' }), undefined)
})
