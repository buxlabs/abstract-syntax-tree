const test = require('ava')
const { FunctionDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new FunctionDeclaration()
  assert.deepEqual(node.type, 'FunctionDeclaration')
})
