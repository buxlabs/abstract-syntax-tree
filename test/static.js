const test = require('./helpers/test')
const {
  generate,
  parse,
  walk,
  replace
} = require('..')

test('it exposes a static parse method', assert => {
  var source = 'var a = 1;'
  var ast = parse(source)
  assert.deepEqual(ast.type, 'Program')
})

test('it exposes a static walk method', assert => {
  var source = 'var a = 1;'
  var ast = parse(source)
  var count = 0
  walk(ast, node => {
    count += 1
  })
  assert.deepEqual(count, 5)
})

test('it exposes a static generate method', assert => {
  var ast = {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42
    }
  }
  var source = generate(ast)
  assert.deepEqual(source, '42;')
})

test('it replaces nodes', assert => {
  var source = 'var a = 1;'
  var ast = parse(source)
  replace(ast, node => {
    if (node.type === 'Identifier' && node.name === 'a') {
      return {
        type: 'Identifier',
        name: 'b'
      }
    }
    return node
  })
  assert.deepEqual(generate(ast), 'var b = 1;\n')
})
