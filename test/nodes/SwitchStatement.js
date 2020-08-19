const test = require('ava')
const { SwitchStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new SwitchStatement()
  assert.deepEqual(node.type, 'SwitchStatement')
})
