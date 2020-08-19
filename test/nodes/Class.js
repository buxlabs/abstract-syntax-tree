const test = require('ava')
const { Class } = require('../..')

test('it sets a correct type', assert => {
  const node = new Class()
  assert.deepEqual(node.type, 'Class')
})
