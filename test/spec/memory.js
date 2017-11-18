import test from 'ava'
import { iterate } from 'leakage'
import AbstractSyntaxTree from '../../index'

test('it does not leak memory', t => {
  iterate(() => {
    const source = 'var x = 0;'
    const ast = new AbstractSyntaxTree(source)
    const declarations = ast.find('VariableDeclaration')
    t.truthy(declarations.length === 1)
    ast.each('Literal', node => {
      node.value = 1
    })
    t.truthy(ast.first('Literal').value === 1)
    t.truthy(ast.has('VariableDeclaration'))
    t.truthy(ast.count('VariableDeclaration') === 1)
    t.truthy(ast.toSource() === 'var x = 1;')
  })
})
