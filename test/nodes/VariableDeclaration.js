const test = require('ava')
const { VariableDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new VariableDeclaration()
  assert.deepEqual(node.type, 'VariableDeclaration')
})
