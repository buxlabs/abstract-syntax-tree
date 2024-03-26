const test = require("node:test")
const assert = require("node:assert")
const { SpreadElement } = require("../..")

test("it sets a correct type", () => {
  const node = new SpreadElement()
  assert.deepEqual(node.type, "SpreadElement")
})
