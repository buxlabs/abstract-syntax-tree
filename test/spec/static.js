import test from 'ava'
import {
  parse,
  walk
} from '../../index'

test('it exposes a static parse method', assert => {
  var source = 'var a = 1;'
  var ast = parse(source)
  assert.truthy(ast.type === 'Program')
})

test('it exposes a static walk method', assert => {
  var source = 'var a = 1;'
  var ast = parse(source)
  var count = 0
  walk(ast, node => {
    count += 1
  })
  assert.truthy(count === 5)
})
