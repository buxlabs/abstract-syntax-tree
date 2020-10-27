const test = require('ava')
const AbstractSyntaxTree = require('../..')
const { logicalExpressionReduction } = require('../..')

test('logicalExpressionReduction', assert => {
  var tree = new AbstractSyntaxTree('const foo = "bar" && "baz"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "baz";\n')

  var tree = new AbstractSyntaxTree('const foo = "bar" || "baz"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "bar";\n')

  var tree = new AbstractSyntaxTree('const foo = undefined || "foo"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "foo";\n')

  var tree = new AbstractSyntaxTree('const foo = null || "foo"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "foo";\n')

  var tree = new AbstractSyntaxTree('const foo = NaN || "foo"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "foo";\n')

  var tree = new AbstractSyntaxTree('const foo = Infinity || "foo"')
  tree.replace(logicalExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = Infinity;\n')
})
