const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: RegExp", () => {
  assert.deepEqual(
    serialize({ type: "Literal", regex: { pattern: "foo", flags: "g" } }),
    /foo/g
  )
})
