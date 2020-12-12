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
  match
} = require('..')

test('parse', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  assert.deepEqual(tree.type, 'Program')
})

test('find: string selector', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  const node = find(tree, 'VariableDeclaration')
  assert.truthy(node)
})

test('find: object selector', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  const node = find(tree, { type: 'VariableDeclaration' })
  assert.truthy(node)
})

test('each', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  let count = 0
  each(tree, 'VariableDeclarator', node => {
    count += 1
  })
  assert.deepEqual(count, 2)
})

test('first', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  const node = first(tree, 'VariableDeclarator')
  assert.deepEqual(node.id.name, 'a')
})

test('last', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  const node = last(tree, 'VariableDeclarator')
  assert.deepEqual(node.id.name, 'b')
})

test('has: string selector', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  assert.truthy(has(tree, 'VariableDeclaration'))
})

test('has: object selector', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  assert.truthy(has(tree, { type: 'VariableDeclaration' }))
})

test('count: string selector', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  const number = count(tree, 'VariableDeclarator')
  assert.deepEqual(number, 2)
})

test('count: object selector', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  const number = count(tree, { type: 'VariableDeclarator' })
  assert.deepEqual(number, 2)
})

test('remove: string selector', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  remove(tree, 'VariableDeclarator[id.name="a"]')
  assert.deepEqual(generate(tree), 'var b = 2;\n')
})

test('remove: object selector', assert => {
  const source = 'var a = 1, b = 2;'
  const tree = parse(source)
  remove(tree, { type: 'VariableDeclarator', id: { name: 'b' } })
  assert.deepEqual(generate(tree), 'var a = 1;\n')
})

test('walk', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
  let count = 0
  walk(tree, node => {
    count += 1
  })
  assert.deepEqual(count, 5)
})

test('generate', assert => {
  const tree = {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42
    }
  }
  const source = generate(tree)
  assert.deepEqual(source, '42;')
})

test('replace', assert => {
  const source = 'var a = 1;'
  const tree = parse(source)
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

test('match: works for a type', assert => {
  assert.truthy(match({ type: 'Literal', value: 1 }, 'Literal'))
  assert.falsy(match({ type: 'Literal', value: 1 }, 'Identifier'))
})

test('match: works for an attribute', assert => {
  assert.truthy(match({ type: 'Literal', value: 1 }, '[value=1]'))
  assert.falsy(match({ type: 'Literal', value: 1 }, '[value=2]'))
})

test('match: works for a type and attribute combination', assert => {
  assert.truthy(match({ type: 'Literal', value: 1 }, 'Literal[value=1]'))
  assert.falsy(match({ type: 'Literal', value: 1 }, 'Literal[value=2]'))
})

test('match: works for multiple levels', assert => {
  const expression = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'foo' },
    property: { type: 'Identifier', name: 'bar' }
  }
  assert.truthy(match(expression, 'MemberExpression[object.name="foo"]'))
  assert.falsy(match(expression, 'MemberExpression[object.name="bar"]'))
})

test('match: works for multiple attributes', assert => {
  const expression = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'foo' },
    property: { type: 'Identifier', name: 'bar' }
  }
  assert.truthy(match(expression, 'MemberExpression[object.name="foo"][property.name="bar"]'))
  assert.falsy(match(expression, 'MemberExpression[object.name="bar"][property.name="foo"]'))
})

test('match: works for objects', assert => {
  assert.truthy(match({ type: 'Literal', value: 1 }, { type: 'Literal', value: 1 }))
  assert.falsy(match({ type: 'Literal', value: 1 }, { type: 'Identifier', name: 'foo' }))
})
