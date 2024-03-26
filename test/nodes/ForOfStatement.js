const test = require("node:test")
const assert = require("node:assert")
const { ForOfStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ForOfStatement()
  assert.deepEqual(node.type, "ForOfStatement")
})
