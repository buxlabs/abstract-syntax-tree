const test = require("node:test")
const assert = require("node:assert")
const { ExportSpecifier } = require("../..")

test("it sets a correct type", () => {
  const node = new ExportSpecifier()
  assert.deepEqual(node.type, "ExportSpecifier")
})
