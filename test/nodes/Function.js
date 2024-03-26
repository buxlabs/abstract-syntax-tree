const test = require("node:test")
const assert = require("node:assert")
const { Function } = require("../..")

test("it sets a correct type", () => {
  const node = new Function()
  assert.deepEqual(node.type, "Function")
})

test("it sets defaults", () => {
  const node = new Function({ name: "foo" })
  assert.deepEqual(node.generator, false)
})
