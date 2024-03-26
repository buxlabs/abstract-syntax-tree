const test = require("node:test")
const assert = require("node:assert")
const { ObjectPattern } = require("../..")

test("it sets a correct type", () => {
  const node = new ObjectPattern()
  assert.deepEqual(node.type, "ObjectPattern")
})
