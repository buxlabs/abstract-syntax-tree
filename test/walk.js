const test = require("ava")
const AbstractSyntaxTree = require("..")

test("it lets you walk over the tree", (assert) => {
  const source = "var a = 1;"
  const tree = new AbstractSyntaxTree(source)
  tree.walk((node) => {
    if (node.type === "VariableDeclaration") {
      node.kind = "const"
    }
  })
  assert.deepEqual(tree.source, "const a = 1;\n")
})

test.skip("it lets you walk over the tree for unknown nodes", (assert) => {
  const source = "var a = 1;"
  const tree = new AbstractSyntaxTree(source)
  tree.walk((node) => {
    if (node.type === "VariableDeclaration") {
      node.type = "FakeNode"
    }
  })
  assert.deepEqual(tree.source, "const a = 1;\n")
})
