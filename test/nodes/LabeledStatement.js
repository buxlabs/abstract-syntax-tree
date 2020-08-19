const test = require('ava')
const { LabeledStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new LabeledStatement()
  assert.deepEqual(node.type, 'LabeledStatement')
})
