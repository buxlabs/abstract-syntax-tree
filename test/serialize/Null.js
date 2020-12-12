const test = require('ava')
const { serialize } = require('../..')

test('serialize: Null', assert => {
  assert.deepEqual(serialize({ type: 'Literal', value: null }), null)
})
