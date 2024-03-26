const test = require("node:test")
const assert = require("node:assert")
const { ContinueStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ContinueStatement()
  assert.deepEqual(node.type, "ContinueStatement")
})
