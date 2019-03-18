const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it appends nodes to the body', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.append({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(tree.source, 'const a = 1;\n"use strict";\n')
})

test('it appends source to the body', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.append('"use strict"')
  assert.deepEqual(tree.source, 'const a = 1;\n"use strict";\n')
})

test('it appends multiple nodes', assert => {
  const tree = new AbstractSyntaxTree('const a = 1')
  tree.append([
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
  assert.deepEqual(tree.source, 'const a = 1;\n"foo";\n"bar";\n')
})

test('it is exposed as a static method', assert => {
  const { parse, append, generate } = AbstractSyntaxTree
  const tree = parse('const a = 1')
  append(tree, '"use strict"')
  assert.deepEqual(generate(tree), 'const a = 1;\n"use strict";\n')
})
