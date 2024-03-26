const test = require("node:test")
const assert = require("node:assert")
const { WithStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new WithStatement()
  assert.deepEqual(node.type, "WithStatement")
})
