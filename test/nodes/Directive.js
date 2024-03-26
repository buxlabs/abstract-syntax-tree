const test = require("node:test")
const assert = require("node:assert")
const { Directive } = require("../..")

test("it sets a correct type", () => {
  const node = new Directive()
  assert.deepEqual(node.type, "Directive")
})
