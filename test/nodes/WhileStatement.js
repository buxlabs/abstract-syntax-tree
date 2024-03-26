const test = require("node:test")
const assert = require("node:assert")
const { WhileStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new WhileStatement()
  assert.deepEqual(node.type, "WhileStatement")
})
