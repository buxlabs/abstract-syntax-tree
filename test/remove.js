const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it removes nodes', assert => {
  var ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  assert.truthy(ast.source === 'var b = 4;\n')
})

test('it removes function declarations', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
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
  var source = 'var a = 1, b = 2; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
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
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
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
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  assert.deepEqual(ast.source, 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes via complex selectors', assert => {
  var source = 'var a = 1; function hello () { var b = 2; return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('BlockStatement > VariableDeclaration')
  assert.deepEqual(ast.source, `var a = 1;\nfunction hello() {\n  return "world";\n}\n`)
})

test('it should be possible to remove the first element only', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
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

test('it removes empty declarations in the callback form', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove((node) => {
    if (node.type === 'VariableDeclarator' && node.id.name === 'a') return null
    return node
  })
  assert.truthy(ast.source === 'function hello() {\n  return "world";\n}\n')
})
