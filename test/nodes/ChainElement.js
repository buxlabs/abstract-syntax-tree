const test = require("node:test")
const assert = require("node:assert")
const { ChainElement } = require("../..")

test("it sets a correct type", () => {
  const node = new ChainElement()
  assert.deepEqual(node.type, "ChainElement")
})
