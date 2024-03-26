const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Infinity", () => {
  assert.deepEqual(
    serialize({ type: "Identifier", name: "Infinity" }),
    Infinity
  )
})
