const test = require("node:test")
const assert = require("node:assert")
const { SwitchCase } = require("../..")

test("it sets a correct type", () => {
  const node = new SwitchCase()
  assert.deepEqual(node.type, "SwitchCase")
})
