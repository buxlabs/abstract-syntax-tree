import test from 'ava'
import AbstractSyntaxTree from '../../index'

test('it lets you drop if statements', assert => {
  var ast = new AbstractSyntaxTree('if (true) { console.log(1); }')
  ast.mark()
  ast.walk((node, parent) => {
    if (node.type === 'IfStatement' && node.test.value === true) {
      parent.body = parent.body.reduce((result, item) => {
        return result.concat(node.id === item.id ? node.consequent.body : item)
      }, [])
    }
  })
  var source = ast.toString()
  assert.truthy(source === 'console.log(1);')
})

test('it lets you calculate binary expressions', assert => {
  var ast = new AbstractSyntaxTree('var a = 1 + 1;')
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
  var source = ast.toString()
  assert.truthy(source === 'var a = 2;')
})

test('it lets you split multiple assignments', assert => {
  var ast = new AbstractSyntaxTree('var a, b;\na = b = 1;')
  var cid = 1
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
        cache = cache.map(current => {
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
  var source = ast.toString()
  assert.deepEqual(source, 'var a, b;\na = 1;\nb = 1;')
})
