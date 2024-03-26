const test = require("node:test")
const assert = require("node:assert")
const { ImportDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ImportDeclaration()
  assert.deepEqual(node.type, "ImportDeclaration")
})
