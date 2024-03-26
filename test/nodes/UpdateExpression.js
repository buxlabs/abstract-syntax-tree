const test = require("node:test")
const assert = require("node:assert")
const { UpdateExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new UpdateExpression()
  assert.deepEqual(node.type, "UpdateExpression")
})
