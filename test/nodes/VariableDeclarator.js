const test = require('ava')
const { VariableDeclarator } = require('../..')

test('it sets a correct type', assert => {
  const node = new VariableDeclarator()
  assert.deepEqual(node.type, 'VariableDeclarator')
})
