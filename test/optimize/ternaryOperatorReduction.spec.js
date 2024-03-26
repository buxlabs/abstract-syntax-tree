const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("../..")
const { ternaryOperatorReduction } = require("../..")

test("ternaryOperatorReduction", () => {
  var tree = new AbstractSyntaxTree('const foo = true ? "bar" : "baz"\n')
  tree.replace(ternaryOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "bar";\n')

  var tree = new AbstractSyntaxTree('const foo = false ? "bar" : "baz"\n')
  tree.replace(ternaryOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "baz";\n')

  var tree = new AbstractSyntaxTree('const foo = [] ? "bar" : "baz"\n')
  tree.replace(ternaryOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "bar";\n')

  var tree = new AbstractSyntaxTree('const foo = {} ? "bar" : "baz"\n')
  tree.replace(ternaryOperatorReduction)
  assert.deepEqual(tree.source, 'const foo = "bar";\n')

  var tree = new AbstractSyntaxTree(
    'const foo = process.env.NODE_ENV === "production" ? "bar" : "baz"\n'
  )
  tree.replace(ternaryOperatorReduction)
  assert.deepEqual(
    tree.source,
    'const foo = process.env.NODE_ENV === "production" ? "bar" : "baz";\n'
  )
})
