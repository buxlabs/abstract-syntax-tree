const test = require("node:test")
const assert = require("node:assert")
const { LabeledStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new LabeledStatement()
  assert.deepEqual(node.type, "LabeledStatement")
})
