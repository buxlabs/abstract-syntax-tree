const test = require("node:test")
const assert = require("node:assert")
const { VariableDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new VariableDeclaration()
  assert.deepEqual(node.type, "VariableDeclaration")
})
