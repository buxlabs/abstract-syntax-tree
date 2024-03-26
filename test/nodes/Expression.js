const test = require("node:test")
const assert = require("node:assert")
const { Expression } = require("../..")

test("it sets a correct type", () => {
  const node = new Expression()
  assert.deepEqual(node.type, "Expression")
})
