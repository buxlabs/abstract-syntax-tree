const test = require("node:test")
const assert = require("node:assert")
const { ExportDefaultDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ExportDefaultDeclaration()
  assert.deepEqual(node.type, "ExportDefaultDeclaration")
})
