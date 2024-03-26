const test = require("node:test")
const assert = require("node:assert")
const { RestElement } = require("../..")

test("it sets a correct type", () => {
  const node = new RestElement()
  assert.deepEqual(node.type, "RestElement")
})
