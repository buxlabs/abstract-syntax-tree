const test = require('ava')
const { TaggedTemplateExpression } = require('../..')

test('it sets a correct type', assert => {
  const node = new TaggedTemplateExpression()
  assert.deepEqual(node.type, 'TaggedTemplateExpression')
})
