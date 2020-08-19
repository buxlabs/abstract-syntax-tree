const test = require('ava')
const { ForInStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ForInStatement()
  assert.deepEqual(node.type, 'ForInStatement')
})
