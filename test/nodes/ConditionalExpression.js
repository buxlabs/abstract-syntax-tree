const test = require("node:test")
const assert = require("node:assert")
const { ConditionalExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ConditionalExpression()
  assert.deepEqual(node.type, "ConditionalExpression")
})
