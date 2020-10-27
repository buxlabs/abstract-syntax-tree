const test = require('ava')
const AbstractSyntaxTree = require('../..')
const { binaryExpressionReduction } = require('../..')

function transform (input) {
  const tree = new AbstractSyntaxTree(input)
  tree.replace(binaryExpressionReduction)
  return tree.source
}

test('binaryExpressionReduction: + operator', assert => {
  assert.deepEqual(transform('const foo = 2 + 2;\n'), 'const foo = 4;\n')
})

test('binaryExpressionReduction: - operator', assert => {
  assert.deepEqual(transform('const foo = 2 - 2;\n'), 'const foo = 0;\n')
})

test('binaryExpressionReduction: * operator', assert => {
  assert.deepEqual(transform('const foo = 2 * 2;\n'), 'const foo = 4;\n')
})

test('binaryExpressionReduction: / operator', assert => {
  assert.deepEqual(transform('const foo = 2 / 2;\n'), 'const foo = 1;\n')
})

test('binaryExpressionReduction: % operator', assert => {
  assert.deepEqual(transform('const foo = 5 % 2;\n'), 'const foo = 1;\n')
})

test('binaryExpressionReduction: ** operator', assert => {
  assert.deepEqual(transform('const foo = 2 ** 3;\n'), 'const foo = 8;\n')
})

test('binaryExpressionReduction: === operator', assert => {
  assert.deepEqual(transform('const foo = 2 === 3;\n'), 'const foo = false;\n')
})

test('binaryExpressionReduction: == operator', assert => {
  assert.deepEqual(transform('const foo = 2 == "2";\n'), 'const foo = true;\n')
})

test('binaryExpressionReduction: !== operator', assert => {
  assert.deepEqual(transform('const foo = 2 !== 3;\n'), 'const foo = true;\n')
})

test('binaryExpressionReduction: != operator', assert => {
  assert.deepEqual(transform('const foo = 2 != "2";\n'), 'const foo = false;\n')
})

test('binaryExpressionReduction: > operator', assert => {
  assert.deepEqual(transform('const foo = 2 > 3;\n'), 'const foo = false;\n')
})

test('binaryExpressionReduction: < operator', assert => {
  assert.deepEqual(transform('const foo = 2 < 3;\n'), 'const foo = true;\n')
})

test('binaryExpressionReduction: >= operator', assert => {
  assert.deepEqual(transform('const foo = 2 >= 3;\n'), 'const foo = false;\n')
})

test('binaryExpressionReduction: <= operator', assert => {
  assert.deepEqual(transform('const foo = 2 <= 3;\n'), 'const foo = true;\n')
})

test('binaryExpressionReduction: & operator', assert => {
  assert.deepEqual(transform('const foo = 7 & 1;\n'), 'const foo = 1;\n')
})

test('binaryExpressionReduction: | operator', assert => {
  assert.deepEqual(transform('const foo = 7 | 1;\n'), 'const foo = 7;\n')
})

test('binaryExpressionReduction: ^ operator', assert => {
  assert.deepEqual(transform('const foo = 7 ^ 1;\n'), 'const foo = 6;\n')
})

test('binaryExpressionReduction: << operator', assert => {
  assert.deepEqual(transform('const foo = 7 << 1;\n'), 'const foo = 14;\n')
})

test('binaryExpressionReduction: >> operator', assert => {
  assert.deepEqual(transform('const foo = 7 >> 1;\n'), 'const foo = 3;\n')
})
