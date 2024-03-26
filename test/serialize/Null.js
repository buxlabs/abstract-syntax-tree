const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Null", () => {
  assert.deepEqual(serialize({ type: "Literal", value: null }), null)
})
