const test = require("node:test")
const assert = require("node:assert")
const { Property } = require("../..")

test("it sets a correct type", () => {
  const node = new Property()
  assert.deepEqual(node.type, "Property")
})
