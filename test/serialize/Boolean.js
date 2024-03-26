const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Boolean", () => {
  assert.deepEqual(serialize({ type: "Literal", value: true }), true)
  assert.deepEqual(serialize({ type: "Literal", value: false }), false)
})
