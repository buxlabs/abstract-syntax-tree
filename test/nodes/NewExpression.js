const test = require("node:test")
const assert = require("node:assert")
const { NewExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new NewExpression()
  assert.deepEqual(node.type, "NewExpression")
})
