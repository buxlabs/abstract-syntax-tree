const test = require("node:test")
const assert = require("node:assert")
const { AssignmentExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new AssignmentExpression()
  assert.deepEqual(node.type, "AssignmentExpression")
})
