const test = require("node:test")
const assert = require("node:assert")
const { MethodDefinition } = require("../..")

test("it sets a correct type", () => {
  const node = new MethodDefinition()
  assert.deepEqual(node.type, "MethodDefinition")
})
