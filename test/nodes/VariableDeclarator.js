const test = require("node:test")
const assert = require("node:assert")
const { VariableDeclarator } = require("../..")

test("it sets a correct type", () => {
  const node = new VariableDeclarator()
  assert.deepEqual(node.type, "VariableDeclarator")
})
