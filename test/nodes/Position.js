const test = require('ava')
const { Position } = require('../..')

test('it sets a correct type', assert => {
  const node = new Position()
  assert.deepEqual(node.type, 'Position')
})
