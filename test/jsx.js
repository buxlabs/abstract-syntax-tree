const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it works for jsx', assert => {
  assert.truthy(new AbstractSyntaxTree('var x = (<div>foo</div>);', { jsx: true }))
})
