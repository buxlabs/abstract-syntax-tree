const test = require("node:test")
const assert = require("node:assert")
const { BigIntLiteral } = require("../..")

test("it sets a correct type", () => {
  const node = new BigIntLiteral()
  assert.deepEqual(node.type, "BigIntLiteral")
})
