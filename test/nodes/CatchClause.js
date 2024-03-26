const test = require("node:test")
const assert = require("node:assert")
const { CatchClause } = require("../..")

test("it sets a correct type", () => {
  const node = new CatchClause()
  assert.deepEqual(node.type, "CatchClause")
})
