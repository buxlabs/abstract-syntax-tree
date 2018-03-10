import test from 'ava'
import AbstractSyntaxTree from '../../index'

test('it works for jsx', assert => {
  assert.truthy(new AbstractSyntaxTree('var x = (<div>foo</div>);', { jsx: true }))
})
