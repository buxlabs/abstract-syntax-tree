const test = require("node:test")
const assert = require("node:assert")
const { Statement } = require("../..")

test("it sets a correct type", () => {
  const node = new Statement()
  assert.deepEqual(node.type, "Statement")
})
