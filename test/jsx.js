const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it works for jsx", () => {
  const tree = new AbstractSyntaxTree("<div>foo</div>;", { jsx: true })
  tree.replace((node) => {
    if (node.type === "JSXIdentifier") {
      return {
        ...node,
        name: "span",
      }
    }
  })
  assert.deepEqual(tree.source.trim(), "<span>foo</span>;")
})
