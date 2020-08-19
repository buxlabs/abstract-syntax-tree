const test = require('ava')
const { BreakStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new BreakStatement()
  assert.deepEqual(node.type, 'BreakStatement')
})
