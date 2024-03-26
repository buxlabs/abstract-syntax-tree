const test = require("node:test")
const assert = require("node:assert")
const { Declaration } = require("../..")

test("it sets a correct type", () => {
  const node = new Declaration()
  assert.deepEqual(node.type, "Declaration")
})
