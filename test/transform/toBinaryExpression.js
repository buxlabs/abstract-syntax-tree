const test = require('ava')
const { toBinaryExpression, ArrayExpression, Literal, generate } = require('../..')

test('it works for 0 elements', assert => {
  const arrayExpression = new ArrayExpression({
    elements: []
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '""')
})

test('it works for 1 element', assert => {
  const arrayExpression = new ArrayExpression({
    elements: [
      new Literal({ value: 'foo' })
    ]
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo"')
})

test('it works for 2 elements', assert => {
  const arrayExpression = new ArrayExpression({
    elements: [
      new Literal({ value: 'foo' }),
      new Literal({ value: 'bar' })
    ]
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo" + "bar"')
})

test('it works for 3 elements', assert => {
  const arrayExpression = new ArrayExpression({
    elements: [
      new Literal({ value: 'foo' }),
      new Literal({ value: 'bar' }),
      new Literal({ value: 'baz' })
    ]
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo" + "bar" + "baz"')
})

test('it works for 4 elements', assert => {
  const arrayExpression = new ArrayExpression({
    elements: [
      new Literal({ value: 'foo' }),
      new Literal({ value: 'bar' }),
      new Literal({ value: 'baz' }),
      new Literal({ value: 'qux' })
    ]
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo" + "bar" + "baz" + "qux"')
})

test('it works for 5 elements', assert => {
  const arrayExpression = new ArrayExpression({
    elements: [
      new Literal({ value: 'foo' }),
      new Literal({ value: 'bar' }),
      new Literal({ value: 'baz' }),
      new Literal({ value: 'qux' }),
      new Literal({ value: 'quux' })
    ]
  })
  const binaryExpression = toBinaryExpression(arrayExpression)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo" + "bar" + "baz" + "qux" + "quux"')
})

test('it works for an array of nodes', assert => {
  const array = [
    new Literal({ value: 'foo' }),
    new Literal({ value: 'bar' }),
    new Literal({ value: 'baz' })
  ]
  const binaryExpression = toBinaryExpression(array)
  const source = generate(binaryExpression)
  assert.deepEqual(source, '"foo" + "bar" + "baz"')
})
