const test = require("node:test")
const assert = require("node:assert")
const { DebuggerStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new DebuggerStatement()
  assert.deepEqual(node.type, "DebuggerStatement")
})
