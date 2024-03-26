const test = require("node:test")
const assert = require("node:assert")
const { ImportNamespaceSpecifier } = require("../..")

test("it sets a correct type", () => {
  const node = new ImportNamespaceSpecifier()
  assert.deepEqual(node.type, "ImportNamespaceSpecifier")
})
