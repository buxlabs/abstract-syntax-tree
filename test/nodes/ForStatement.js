const test = require("node:test")
const assert = require("node:assert")
const { ForStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ForStatement()
  assert.deepEqual(node.type, "ForStatement")
})
