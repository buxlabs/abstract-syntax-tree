const test = require("node:test")
const assert = require("node:assert")
const { SequenceExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new SequenceExpression()
  assert.deepEqual(node.type, "SequenceExpression")
})
