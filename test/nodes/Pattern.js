const test = require("node:test")
const assert = require("node:assert")
const { Pattern } = require("../..")

test("it sets a correct type", () => {
  const node = new Pattern()
  assert.deepEqual(node.type, "Pattern")
})
