const test = require("node:test")
const assert = require("node:assert")
const { ExportNamedDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ExportNamedDeclaration()
  assert.deepEqual(node.type, "ExportNamedDeclaration")
})
