const test = require('ava')
const { Program } = require('../..')

test('it sets a correct type', assert => {
  const node = new Program()
  assert.deepEqual(node.type, 'Program')
})

test('it sets defaults', assert => {
  const node = new Program()
  assert.deepEqual(node.sourceType, 'script')
  assert.deepEqual(node.body, [])
})
