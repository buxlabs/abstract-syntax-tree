const test = require('ava')
const { EmptyStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new EmptyStatement()
  assert.deepEqual(node.type, 'EmptyStatement')
})
