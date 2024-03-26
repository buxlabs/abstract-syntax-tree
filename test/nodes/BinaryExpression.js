const test = require("node:test")
const assert = require("node:assert")
const { BinaryExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new BinaryExpression()
  assert.deepEqual(node.type, "BinaryExpression")
})

test("it assigns additional properties", () => {
  const node = new BinaryExpression({
    left: { type: "Identifier", name: "foo" },
    right: { type: "Identifier", name: "bar" },
    operator: "===",
  })
  assert.deepEqual(node.operator, "===")
})
