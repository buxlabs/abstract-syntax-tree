const test = require("node:test")
const assert = require("node:assert")
const { ModuleDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ModuleDeclaration()
  assert.deepEqual(node.type, "ModuleDeclaration")
})
