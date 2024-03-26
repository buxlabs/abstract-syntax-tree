const test = require("node:test")
const assert = require("node:assert")
const { SourceLocation } = require("../..")

test("it sets a correct type", () => {
  const node = new SourceLocation()
  assert.deepEqual(node.type, "SourceLocation")
})
