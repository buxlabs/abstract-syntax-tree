const test = require("node:test")
const assert = require("node:assert")
const { UnaryOperator } = require("../..")

test("it sets a correct type", () => {
  const node = new UnaryOperator()
  assert.deepEqual(node.type, "UnaryOperator")
})
