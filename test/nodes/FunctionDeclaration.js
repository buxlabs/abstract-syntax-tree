const test = require("node:test")
const assert = require("node:assert")
const { FunctionDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new FunctionDeclaration()
  assert.deepEqual(node.type, "FunctionDeclaration")
})
