const test = require("node:test")
const assert = require("node:assert")
const { ExportAllDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ExportAllDeclaration()
  assert.deepEqual(node.type, "ExportAllDeclaration")
})
