const test = require("node:test")
const assert = require("node:assert")
const { FunctionBody } = require("../..")

test("it sets a correct type", () => {
  const node = new FunctionBody()
  assert.deepEqual(node.type, "FunctionBody")
})
