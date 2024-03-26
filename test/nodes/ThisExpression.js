const test = require("node:test")
const assert = require("node:assert")
const { ThisExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ThisExpression()
  assert.deepEqual(node.type, "ThisExpression")
})
