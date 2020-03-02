const test = require('ava')
const AbstractSyntaxTree = require('..')

test('it lets you set the body of the program', assert => {
  const tree = new AbstractSyntaxTree()
  tree.body = [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'Literal',
        value: 'use strict'
      }
    }
  ]
  assert.deepEqual(tree.source, '"use strict";\n')
})
