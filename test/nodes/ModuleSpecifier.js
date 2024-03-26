const test = require("node:test")
const assert = require("node:assert")
const { ModuleSpecifier } = require("../..")

test("it sets a correct type", () => {
  const node = new ModuleSpecifier()
  assert.deepEqual(node.type, "ModuleSpecifier")
})
