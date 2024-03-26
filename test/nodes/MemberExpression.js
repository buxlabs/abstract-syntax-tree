const test = require("node:test")
const assert = require("node:assert")
const { MemberExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new MemberExpression()
  assert.deepEqual(node.type, "MemberExpression")
})

test("it sets computed to false", () => {
  const node = new MemberExpression()
  assert.deepEqual(node.computed, false)
})
