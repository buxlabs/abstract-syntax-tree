const test = require('../helpers/test')
const { iterate } = require('leakage')
const AbstractSyntaxTree = require('..')

test('it does not leak memory', assert => {
  iterate(() => {
    const source = 'var x = 0;'
    const ast = new AbstractSyntaxTree(source)
    const declarations = ast.find('VariableDeclaration')
    assert.ok(declarations.length === 1)
    ast.each('Literal', node => {
      node.value = 1
    })
    assert.ok(ast.first('Literal').value === 1)
    assert.ok(ast.has('VariableDeclaration'))
    assert.ok(ast.count('VariableDeclaration') === 1)
    assert.ok(ast.toSource() === 'var x = 1;')
  })
})
