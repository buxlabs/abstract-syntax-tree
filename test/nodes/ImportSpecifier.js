const test = require("node:test")
const assert = require("node:assert")
const { ImportSpecifier } = require("../..")

test("it sets a correct type", () => {
  const node = new ImportSpecifier()
  assert.deepEqual(node.type, "ImportSpecifier")
})
