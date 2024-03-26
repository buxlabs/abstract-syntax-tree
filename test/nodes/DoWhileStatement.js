const test = require("node:test")
const assert = require("node:assert")
const { DoWhileStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new DoWhileStatement()
  assert.deepEqual(node.type, "DoWhileStatement")
})
