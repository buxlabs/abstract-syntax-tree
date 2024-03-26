const test = require("node:test")
const assert = require("node:assert")
const { TemplateLiteral } = require("../..")

test("it sets a correct type", () => {
  const node = new TemplateLiteral()
  assert.deepEqual(node.type, "TemplateLiteral")
})
