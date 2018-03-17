import test from 'ava'
import {
  generate,
  parse,
  walk
} from '../../index'

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
