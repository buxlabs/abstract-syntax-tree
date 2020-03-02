const test = require('ava')
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

test('it appends nodes to an array', assert => {
  const { append, generate } = AbstractSyntaxTree
  const body = []
  append(body, '"use strict"')
  const tree = { type: 'Program', body }
  assert.deepEqual(generate(tree), '"use strict";\n')
})

test('it appends nodes to the body of given node', assert => {
  const { append, generate } = AbstractSyntaxTree
  const tree = { type: 'Program', body: [] }
  append(tree, '"use strict"')
  assert.deepEqual(generate(tree), '"use strict";\n')
})

test('is a noop for nodes without body', assert => {
  const { append, generate } = AbstractSyntaxTree
  const literal = { type: 'Literal', value: 42 }
  append(literal, '"use strict"')
  const tree = {
    type: 'Program',
    body: [
      { type: 'ExpressionStatement', expression: literal }
    ]
  }
  assert.deepEqual(generate(tree), '42;\n')
})
