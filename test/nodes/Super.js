const test = require("node:test")
const assert = require("node:assert")
const { Super } = require("../..")

test("it sets a correct type", () => {
  const node = new Super()
  assert.deepEqual(node.type, "Super")
})
