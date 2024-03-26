const test = require("node:test")
const assert = require("node:assert")
const { ArrayPattern } = require("../..")

test("it sets a correct type", () => {
  const node = new ArrayPattern()
  assert.deepEqual(node.type, "ArrayPattern")
})
