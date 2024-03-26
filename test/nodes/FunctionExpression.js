const test = require("node:test")
const assert = require("node:assert")
const { FunctionExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new FunctionExpression()
  assert.deepEqual(node.type, "FunctionExpression")
})
