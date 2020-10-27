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

test('binaryExpressionReduction: two + operators', assert => {
  assert.deepEqual(transform('const foo = 2 + 2 + 2;\n'), 'const foo = 6;\n')
})

test('binaryExpressionReduction: three + operators', assert => {
  assert.deepEqual(transform('const foo = 2 + 2 + 2 + 2;\n'), 'const foo = 8;\n')
})

test('binaryExpressionReduction: + and - operators', assert => {
  assert.deepEqual(transform('const foo = 2 + 2 - 2;\n'), 'const foo = 2;\n')
})

test('binaryExpressionReduction: - and + operators', assert => {
  assert.deepEqual(transform('const foo = 2 - 2 + 2;\n'), 'const foo = 2;\n')
})

test('binaryExpressionReduction: + and * operators', assert => {
  assert.deepEqual(transform('const foo = 2 + 2 * 2;\n'), 'const foo = 6;\n')
  assert.deepEqual(transform('const foo = 3 + 3 * 3;\n'), 'const foo = 12;\n')
  assert.deepEqual(transform('const foo = 4 + 4 * 4;\n'), 'const foo = 20;\n')
  assert.deepEqual(transform('const foo = 2 + 2 * 2 + 2 * 2;\n'), 'const foo = 10;\n')
  assert.deepEqual(transform('const foo = 3 + 3 * 3 + 3 * 3;\n'), 'const foo = 21;\n')
  assert.deepEqual(transform('const foo = 4 + 4 * 4 + 4 * 4;\n'), 'const foo = 36;\n')
  assert.deepEqual(transform('const foo = 4 + (5 * 5);\n'), 'const foo = 29;\n')
  assert.deepEqual(transform('const foo = (4 + 5) * 5;\n'), 'const foo = 45;\n')
})

test('binaryExpressionReduction: * and + operators', assert => {
  assert.deepEqual(transform('const foo = 2 * 2 + 2;\n'), 'const foo = 6;\n')
  assert.deepEqual(transform('const foo = 3 * 3 + 3;\n'), 'const foo = 12;\n')
  assert.deepEqual(transform('const foo = 4 * 4 + 4;\n'), 'const foo = 20;\n')
  assert.deepEqual(transform('const foo = 2 * 2 + 2 * 2 + 2;\n'), 'const foo = 10;\n')
  assert.deepEqual(transform('const foo = 3 * 3 + 3 * 3 + 3;\n'), 'const foo = 21;\n')
  assert.deepEqual(transform('const foo = 4 * 4 + 4 * 4 + 4;\n'), 'const foo = 36;\n')
  assert.deepEqual(transform('const foo = 4 * (5 + 5);\n'), 'const foo = 40;\n')
  assert.deepEqual(transform('const foo = (4 * 5) + 5;\n'), 'const foo = 25;\n')
})
