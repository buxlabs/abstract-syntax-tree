const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it lets you walk over the tree", () => {
  const source = "var a = 1;"
  const tree = new AbstractSyntaxTree(source)
  tree.walk((node) => {
    if (node.type === "VariableDeclaration") {
      node.kind = "const"
    }
  })
  assert.deepEqual(tree.source, "const a = 1;\n")
})
