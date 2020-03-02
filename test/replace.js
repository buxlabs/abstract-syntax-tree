const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it can be used with a callback syntax', assert => {
  const source = 'const a = 1'
  const tree = new AbstractSyntaxTree(source)
  tree.replace(node => {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'var'
    }
    return node
  })
  assert.deepEqual(tree.source, 'var a = 1;\n')
})

test('it replaces nodes on enter', assert => {
  const source = 'const a = 1'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    enter (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'let'
      }
      return node
    }
  })
  assert.deepEqual(tree.source, 'let a = 1;\n')
})

test('it replaces nodes on leave', assert => {
  const source = 'const a = 1'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'let'
      }
      return node
    }
  })
  assert.deepEqual(tree.source, 'let a = 1;\n')
})

test('it can replace given node with multiple nodes', assert => {
  const source = '"foo";"bar";'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave (node) {
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'Literal' &&
        node.expression.value === 'bar'
      ) {
        return [
          {
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: 'baz' }
          },
          {
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: 'qux' }
          }
        ]
      }
      return node
    }
  })
  assert.deepEqual(tree.source, '"foo";\n"baz";\n"qux";\n')
})

test('it can remove given node', assert => {
  const source = '"foo";"bar";'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave (node) {
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'Literal' &&
        node.expression.value === 'bar'
      ) {
        return null
      }
      return node
    }
  })
  assert.deepEqual(tree.source, '"foo";\n')
})
