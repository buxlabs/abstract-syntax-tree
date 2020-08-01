const test = require('ava')
const { Node } = require('../..')

test('it sets a correct type', assert => {
  const node = new Node()
  assert.deepEqual(node.type, 'Node')
})
