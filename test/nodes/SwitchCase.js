const test = require('ava')
const { SwitchCase } = require('../..')

test('it sets a correct type', assert => {
  const node = new SwitchCase()
  assert.deepEqual(node.type, 'SwitchCase')
})
