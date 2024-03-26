const test = require("node:test")
const assert = require("node:assert")
const { AssignmentPattern } = require("../..")

test("it sets a correct type", () => {
  const node = new AssignmentPattern()
  assert.deepEqual(node.type, "AssignmentPattern")
})
