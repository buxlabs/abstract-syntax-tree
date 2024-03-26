const test = require("node:test")
const assert = require("node:assert")
const { ThrowStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ThrowStatement()
  assert.deepEqual(node.type, "ThrowStatement")
})
