const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: String", () => {
  assert.deepEqual(serialize({ type: "Literal", value: "42" }), "42")
})
