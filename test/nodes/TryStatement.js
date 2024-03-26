const test = require("node:test")
const assert = require("node:assert")
const { TryStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new TryStatement()
  assert.deepEqual(node.type, "TryStatement")
})
