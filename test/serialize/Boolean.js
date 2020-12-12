const test = require('ava')
const { serialize } = require('../..')

test('serialize: Boolean', assert => {
  assert.deepEqual(serialize({ type: 'Literal', value: true }), true)
  assert.deepEqual(serialize({ type: 'Literal', value: false }), false)
})
