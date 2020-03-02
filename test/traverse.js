const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it lets you traverse over the tree', assert => {
  const source = 'var a = 1;'
  const tree = new AbstractSyntaxTree(source)
  tree.traverse({
    enter (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'const'
      }
      return node
    }
  })
  assert.deepEqual(tree.source, 'const a = 1;\n')
})

test('it is exposed as a static method', assert => {
  const { parse, traverse, generate } = AbstractSyntaxTree
  const tree = parse('var a = 1')
  traverse(tree, {
    enter (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'const'
      }
      return node
    }
  })
  assert.deepEqual(generate(tree), 'const a = 1;\n')
})
