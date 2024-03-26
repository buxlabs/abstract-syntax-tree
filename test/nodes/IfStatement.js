const test = require("node:test")
const assert = require("node:assert")
const { IfStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new IfStatement()
  assert.deepEqual(node.type, "IfStatement")
})
