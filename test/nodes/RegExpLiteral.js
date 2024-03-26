const test = require("node:test")
const assert = require("node:assert")
const { RegExpLiteral } = require("../..")

test("it sets a correct type", () => {
  const node = new RegExpLiteral()
  assert.deepEqual(node.type, "RegExpLiteral")
})
