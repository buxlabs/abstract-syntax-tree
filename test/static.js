const test = require('ava')
const {
  find,
  each,
  first,
  last,
  has,
  count,
  generate,
  parse,
  walk,
  replace,
  remove,
  template
} = require('..')

test('parse', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  assert.deepEqual(tree.type, 'Program')
})

test('find: string selector', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  var node = find(tree, 'VariableDeclaration')
  assert.truthy(node)
})

test('find: object selector', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  var node = find(tree, { type: 'VariableDeclaration' })
  assert.truthy(node)
})

test('each', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  var count = 0
  each(tree, 'VariableDeclarator', node => {
    count += 1
  })
  assert.deepEqual(count, 2)
})

test('first', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  var node = first(tree, 'VariableDeclarator')
  assert.deepEqual(node.id.name, 'a')
})

test('last', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  var node = last(tree, 'VariableDeclarator')
  assert.deepEqual(node.id.name, 'b')
})

test('has: string selector', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  assert.truthy(has(tree, 'VariableDeclaration'))
})

test('has: object selector', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  assert.truthy(has(tree, { type: 'VariableDeclaration' }))
})

test('count: string selector', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  var number = count(tree, 'VariableDeclarator')
  assert.deepEqual(number, 2)
})

test('count: object selector', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  var number = count(tree, { type: 'VariableDeclarator' })
  assert.deepEqual(number, 2)
})

test('remove: string selector', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  remove(tree, 'VariableDeclarator[id.name="a"]')
  assert.deepEqual(generate(tree), 'var b = 2;\n')
})

test('remove: object selector', assert => {
  var source = 'var a = 1, b = 2;'
  var tree = parse(source)
  remove(tree, { type: 'VariableDeclarator', id: { name: 'b' } })
  assert.deepEqual(generate(tree), 'var a = 1;\n')
})

test('walk', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  var count = 0
  walk(tree, node => {
    count += 1
  })
  assert.deepEqual(count, 5)
})

test('generate', assert => {
  var tree = {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42
    }
  }
  var source = generate(tree)
  assert.deepEqual(source, '42;')
})

test('replace', assert => {
  var source = 'var a = 1;'
  var tree = parse(source)
  replace(tree, {
    enter: node => {
      if (node.type === 'Identifier' && node.name === 'a') {
        return {
          type: 'Identifier',
          name: 'b'
        }
      }
      return node
    }
  })
  assert.deepEqual(generate(tree), 'var b = 1;\n')
})

test('template: from string', assert => {
  assert.truthy(template('"use strict";')[0].type === 'ExpressionStatement')
})

test('template: from string with params', assert => {
  assert.truthy(template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('template: from numbers', assert => {
  assert.truthy(template(1).type === 'Literal')
})
