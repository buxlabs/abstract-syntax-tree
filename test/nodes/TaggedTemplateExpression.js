const test = require("node:test")
const assert = require("node:assert")
const { TaggedTemplateExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new TaggedTemplateExpression()
  assert.deepEqual(node.type, "TaggedTemplateExpression")
})
