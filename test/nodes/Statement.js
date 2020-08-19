const test = require('ava')
const { Statement } = require('../..')

test('it sets a correct type', assert => {
  const node = new Statement()
  assert.deepEqual(node.type, 'Statement')
})
