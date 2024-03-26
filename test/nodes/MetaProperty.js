const test = require("node:test")
const assert = require("node:assert")
const { MetaProperty } = require("../..")

test("it sets a correct type", () => {
  const node = new MetaProperty()
  assert.deepEqual(node.type, "MetaProperty")
})
