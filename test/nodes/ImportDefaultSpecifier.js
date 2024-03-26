const test = require("node:test")
const assert = require("node:assert")
const { ImportDefaultSpecifier } = require("../..")

test("it sets a correct type", () => {
  const node = new ImportDefaultSpecifier()
  assert.deepEqual(node.type, "ImportDefaultSpecifier")
})
