const test = require("node:test")
const assert = require("node:assert")
const { ChainExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ChainExpression()
  assert.deepEqual(node.type, "ChainExpression")
})
