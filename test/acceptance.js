const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it lets you create an empty tree and append nodes to it', assert => {
  const tree = new AbstractSyntaxTree()
  tree.append({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(tree.source, '"use strict";\n')
})

test('it lets you drop if statements', assert => {
  const ast = new AbstractSyntaxTree('if (true) { console.log(1); }')
  ast.mark()
  ast.walk((node, parent) => {
    if (node.type === 'IfStatement' && node.test.value === true) {
      parent.body = parent.body.reduce((result, item) => {
        return result.concat(node.id === item.id ? node.consequent.body : item)
      }, [])
    }
  })
  const source = ast.source
  assert.deepEqual(source, 'console.log(1);\n')
})

test('it lets you replace multiple nodes', assert => {
  const ast = new AbstractSyntaxTree('if (true) { console.log(1); console.log(2); }')
  ast.replace({
    enter: (node, parent) => {
      if (node.type === 'IfStatement' && node.test.value === true) {
        return node.consequent.body
      }
      return node
    }
  })
  const source = ast.source
  assert.deepEqual(source, 'console.log(1);\nconsole.log(2);\n')
})

test('it lets you remove nodes', assert => {
  const ast = new AbstractSyntaxTree('if (false) { console.log(1); }')
  ast.replace({
    enter (node, parent) {
      if (node.type === 'IfStatement' && node.test.value === false) {
        return null
      }
      return node
    }
  })
  const source = ast.source
  assert.deepEqual(source, '')
})

test('it does not replace node when undefined is passed', assert => {
  const ast = new AbstractSyntaxTree('if (false) { console.log(1); }')
  ast.replace({
    enter (node, parent) {
      if (node.type === 'IfStatement' && node.test.value === false) {
        return undefined
      }
      return node
    }
  })
  const source = ast.source
  assert.deepEqual(source, 'if (false) {\n  console.log(1);\n}\n')
})

test('it lets you calculate binary expressions', assert => {
  const ast = new AbstractSyntaxTree('var a = 1 + 1;')
  ast.replace({
    enter: node => {
      if (node.type === 'BinaryExpression' &&
        node.left.type === 'Literal' && node.right.type === 'Literal' &&
        typeof node.left.value === 'number' &&
        typeof node.right.value === 'number') {
        return {
          type: 'Literal', value: node.left.value + node.right.value
        }
      }
      return node
    }
  })
  const source = ast.source
  assert.deepEqual(source, 'var a = 2;\n')
})

test('it lets you split multiple assignments', assert => {
  const ast = new AbstractSyntaxTree('var a, b;\na = b = 1;')
  let cid = 1
  ast.walk((node, parent) => {
    node.cid = cid
    cid += 1
    if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
      if (node.expression.right.type === 'AssignmentExpression') {
        let cache = [node.expression.left]
        while (node.expression.right.type === 'AssignmentExpression') {
          cache.push(node.expression.right.left)
          node.expression.right = node.expression.right.right
        }
        cache = cache.reverse().map(current => {
          return {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              left: current,
              right: node.expression.right,
              operator: '='
            }
          }
        })
        parent.body = parent.body.reduce((result, item) => {
          return result.concat(node.cid === item.cid ? cache : item)
        }, [])
      }
    }
  })
  const source = ast.source
  assert.deepEqual(source, 'var a, b;\nb = 1;\na = 1;\n')
})
