const test = require("node:test")
const assert = require("node:assert")
const { ClassDeclaration } = require("../..")

test("it sets a correct type", () => {
  const node = new ClassDeclaration()
  assert.deepEqual(node.type, "ClassDeclaration")
})
