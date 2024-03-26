const test = require("node:test")
const assert = require("node:assert")
const { ObjectExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ObjectExpression()
  assert.deepEqual(node.type, "ObjectExpression")
})
