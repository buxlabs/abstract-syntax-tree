const test = require('ava')
const { TemplateElement } = require('../..')

test('it sets a correct type', assert => {
  const node = new TemplateElement()
  assert.deepEqual(node.type, 'TemplateElement')
})
