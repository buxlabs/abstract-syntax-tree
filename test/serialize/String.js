const test = require('ava')
const { serialize } = require('../..')

test('serialize: String', assert => {
  assert.deepEqual(serialize({ type: 'Literal', value: '42' }), '42')
})
