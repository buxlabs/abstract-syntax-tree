const test = require('ava')
const { DebuggerStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new DebuggerStatement()
  assert.deepEqual(node.type, 'DebuggerStatement')
})
