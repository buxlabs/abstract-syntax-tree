const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it prepends nodes to the body', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.prepend({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(tree.source, '"use strict";\nconst a = 1;\n')
})

test('it prepends source to the body', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.prepend('"use strict"')
  assert.deepEqual(tree.source, '"use strict";\nconst a = 1;\n')
})

test('it prepends multiple nodes', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.prepend([
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'Literal',
        value: 'foo'
      }
    },
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'Literal',
        value: 'bar'
      }
    }
  ])
  assert.deepEqual(tree.source, '"foo";\n"bar";\nconst a = 1;\n')
})
