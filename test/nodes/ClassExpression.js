const test = require("node:test")
const assert = require("node:assert")
const { ClassExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new ClassExpression()
  assert.deepEqual(node.type, "ClassExpression")
})
