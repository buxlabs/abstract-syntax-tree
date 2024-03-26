const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Undefined", () => {
  assert.deepEqual(
    serialize({ type: "Identifier", name: "undefined" }),
    undefined
  )
})
