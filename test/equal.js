const test = require('ava')
const { equal } = require('..')

test('equal', assert => {
  assert.truthy(equal({ type: 'ReturnStatement' }, { type: 'ReturnStatement' }))
})
