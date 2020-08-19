const test = require('ava')
const { CallExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new CallExpression()
  assert.deepEqual(node.type, 'CallExpression')
})
