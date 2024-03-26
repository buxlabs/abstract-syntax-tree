const test = require("node:test")
const assert = require("node:assert")
const { BreakStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new BreakStatement()
  assert.deepEqual(node.type, "BreakStatement")
})
