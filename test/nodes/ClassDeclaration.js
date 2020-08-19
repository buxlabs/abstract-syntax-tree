const test = require('ava')
const { ClassDeclaration } = require('../..')

test('it sets a correct type', assert => {
  const node = new ClassDeclaration()
  assert.deepEqual(node.type, 'ClassDeclaration')
})
