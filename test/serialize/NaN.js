const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: NaN", () => {
  assert(isNaN(serialize({ type: "Identifier", name: "NaN" })))
})
