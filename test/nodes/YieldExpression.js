const test = require("node:test")
const assert = require("node:assert")
const { YieldExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new YieldExpression()
  assert.deepEqual(node.type, "YieldExpression")
})
