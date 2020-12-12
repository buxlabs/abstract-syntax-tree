const test = require('ava')
const { serialize } = require('../..')

test('serialize: RegExp', assert => {
  assert.deepEqual(serialize({ type: 'Literal', regex: { pattern: 'foo', flags: 'g' } }), /foo/g)
})
