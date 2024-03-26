const test = require("node:test")
const assert = require("node:assert")
const { BinaryOperator } = require("../..")

test("it sets a correct type", () => {
  const node = new BinaryOperator()
  assert.deepEqual(node.type, "BinaryOperator")
})
