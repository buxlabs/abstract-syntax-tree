import test from 'ava'
import { iterate } from 'leakage'
import AbstractSyntaxTree from '../../index'

test('it does not leak memory', assert => {
  iterate(() => {
    const source = 'var x = 0;'
    const ast = new AbstractSyntaxTree(source)
    const declarations = ast.find('VariableDeclaration')
    assert.truthy(declarations.length === 1)
    ast.each('Literal', node => {
      node.value = 1
    })
    assert.truthy(ast.first('Literal').value === 1)
    assert.truthy(ast.has('VariableDeclaration'))
    assert.truthy(ast.count('VariableDeclaration') === 1)
    assert.truthy(ast.toSource() === 'var x = 1;')
  })
})
