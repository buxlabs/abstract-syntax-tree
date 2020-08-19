const test = require('ava')
const { WithStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new WithStatement()
  assert.deepEqual(node.type, 'WithStatement')
})
