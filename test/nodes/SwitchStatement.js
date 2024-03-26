const test = require("node:test")
const assert = require("node:assert")
const { SwitchStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new SwitchStatement()
  assert.deepEqual(node.type, "SwitchStatement")
})
