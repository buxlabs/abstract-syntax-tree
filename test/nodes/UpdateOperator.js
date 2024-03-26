const test = require("node:test")
const assert = require("node:assert")
const { UpdateOperator } = require("../..")

test("it sets a correct type", () => {
  const node = new UpdateOperator()
  assert.deepEqual(node.type, "UpdateOperator")
})
