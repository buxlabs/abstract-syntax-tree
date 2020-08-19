const test = require('ava')
const { TemplateLiteral } = require('../..')

test('it sets a correct type', assert => {
  const node = new TemplateLiteral()
  assert.deepEqual(node.type, 'TemplateLiteral')
})
