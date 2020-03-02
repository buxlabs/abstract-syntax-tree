const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it works for jsx', assert => {
  assert.truthy(new AbstractSyntaxTree('var x = (<div>foo</div>);', { jsx: true }))
})
