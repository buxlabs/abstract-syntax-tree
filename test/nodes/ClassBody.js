const test = require('ava')
const { ClassBody } = require('../..')

test('it sets a correct type', assert => {
  const node = new ClassBody()
  assert.deepEqual(node.type, 'ClassBody')
})
