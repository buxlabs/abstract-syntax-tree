const test = require("node:test")
const assert = require("node:assert")
const { Class } = require("../..")

test("it sets a correct type", () => {
  const node = new Class()
  assert.deepEqual(node.type, "Class")
})
