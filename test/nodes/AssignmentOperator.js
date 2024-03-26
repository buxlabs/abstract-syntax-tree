const test = require("node:test")
const assert = require("node:assert")
const { AssignmentOperator } = require("../..")

test("it sets a correct type", () => {
  const node = new AssignmentOperator()
  assert.deepEqual(node.type, "AssignmentOperator")
})
