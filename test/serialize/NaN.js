const test = require('ava')
const { serialize } = require('../..')

test('serialize: NaN', assert => {
  assert.truthy(isNaN(serialize({ type: 'Identifier', name: 'NaN' })))
})
