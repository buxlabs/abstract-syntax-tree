const test = require('ava')
const { IfStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new IfStatement()
  assert.deepEqual(node.type, 'IfStatement')
})
