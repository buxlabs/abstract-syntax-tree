const test = require("node:test")
const assert = require("node:assert")
const { AwaitExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new AwaitExpression()
  assert.deepEqual(node.type, "AwaitExpression")
})
