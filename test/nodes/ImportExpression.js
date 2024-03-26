const test = require("node:test")
const assert = require("node:assert")
const { ImportExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ImportExpression()
  assert.deepEqual(node.type, "ImportExpression")
})
