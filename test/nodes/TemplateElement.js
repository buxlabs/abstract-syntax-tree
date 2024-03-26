const test = require("node:test")
const assert = require("node:assert")
const { TemplateElement } = require("../..")

test("it sets a correct type", () => {
  const node = new TemplateElement()
  assert.deepEqual(node.type, "TemplateElement")
})
