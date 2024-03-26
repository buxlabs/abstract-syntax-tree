const test = require("node:test")
const assert = require("node:assert")
const { ReturnStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ReturnStatement()
  assert.deepEqual(node.type, "ReturnStatement")
})
