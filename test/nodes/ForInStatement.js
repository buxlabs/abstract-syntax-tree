const test = require("node:test")
const assert = require("node:assert")
const { ForInStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ForInStatement()
  assert.deepEqual(node.type, "ForInStatement")
})
