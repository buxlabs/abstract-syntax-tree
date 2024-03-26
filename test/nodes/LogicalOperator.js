const test = require("node:test")
const assert = require("node:assert")
const { LogicalOperator } = require("../..")

test("it sets a correct type", () => {
  const node = new LogicalOperator()
  assert.deepEqual(node.type, "LogicalOperator")
})
