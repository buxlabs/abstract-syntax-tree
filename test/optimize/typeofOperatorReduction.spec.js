const test = require('ava')
const AbstractSyntaxTree = require('../..')
const { typeofOperatorReduction } = require('../..')

test('typeofOperatorReduction', assert => {
  var tree = new AbstractSyntaxTree('const foo = typeof "baz"\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "string";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof 42\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "number";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof []\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "object";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof {}\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "object";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof Infinity\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "number";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof NaN\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "number";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof undefined\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "undefined";\n')

  var tree = new AbstractSyntaxTree('const foo = typeof null\n')
  tree.replace(typeofOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "object";\n')
})
