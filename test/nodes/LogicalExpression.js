const test = require("node:test")
const assert = require("node:assert")
const { LogicalExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new LogicalExpression()
  assert.deepEqual(node.type, "LogicalExpression")
})
