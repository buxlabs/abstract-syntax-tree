const test = require('ava')
const { ImportExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new ImportExpression()
  assert.deepEqual(node.type, 'ImportExpression')
})
