const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("../..")
const { memberExpressionReduction } = require("../..")

test("memberExpressionReduction", () => {
  var tree = new AbstractSyntaxTree('const foo = ({ bar: "baz" }).bar\n')
  tree.replace(memberExpressionReduction)
  assert.deepEqual(tree.source, 'const foo = "baz";\n')

  var tree = new AbstractSyntaxTree(
    'const foo = "bar"; const bar = ({ foo }).foo\n'
  )
  tree.replace(memberExpressionReduction)
  assert.deepEqual(
    tree.source,
    'const foo = "bar";\nconst bar = ({\n  foo\n}).foo;\n'
  )
})
