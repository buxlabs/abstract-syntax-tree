const test = require("node:test")
const assert = require("node:assert")
const { EmptyStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new EmptyStatement()
  assert.deepEqual(node.type, "EmptyStatement")
})
