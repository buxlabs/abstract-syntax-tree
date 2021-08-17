const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it removes nodes', assert => {
  const ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  assert.truthy(ast.source === 'var b = 4;\n')
})

test('it removes function declarations', assert => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: 'hello'
    }
  })
  assert.truthy(ast.source === 'var a = 1;\n')
})

test('it keeps variable declarations', assert => {
  const source = 'var a = 1, b = 2; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  assert.truthy(ast.source === 'var b = 2;\nfunction hello() {\n  return "world";\n}\n')
})

test('it removes empty declarations', assert => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  assert.truthy(ast.source === 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes if string is provided', assert => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  assert.deepEqual(ast.source, 'function hello() {\n  return "world";\n}\n')
})

test('it should be possible to remove the first element only', assert => {
  const source = 'var a = 1; var b = 2;'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({ type: 'VariableDeclaration' }, { first: true })
  assert.truthy(ast.source === 'var b = 2;\n')
})

test('it lets you remove empty statements', assert => {
  const tree = new AbstractSyntaxTree('var a = 1;;')
  assert.deepEqual(tree.source, 'var a = 1;\n;\n')
  tree.remove({ type: 'EmptyStatement' })
  assert.deepEqual(tree.source, 'var a = 1;\n')
})

test('it lets you define a callback', assert => {
  const tree = new AbstractSyntaxTree('var a = 1;;')
  tree.remove((node) => {
    if (node.type === 'EmptyStatement') return null
    return node
  })
  assert.deepEqual(tree.source, 'var a = 1;\n')
})

test('it lets you define a callback with a parent', assert => {
  const tree = new AbstractSyntaxTree('var a = [1, 2]')
  tree.remove((node, parent) => {
    if (node.type === 'Literal' && parent.type === 'ArrayExpression') return null
    return node
  })
  assert.deepEqual(tree.source, 'var a = [];\n')
})

test('it removes empty declarations in the callback form', assert => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove((node) => {
    if (node.type === 'VariableDeclarator' && node.id.name === 'a') return null
    return node
  })
  assert.truthy(ast.source === 'function hello() {\n  return "world";\n}\n')
})
