const test = require("node:test")
const assert = require("node:assert")
const { Identifier } = require("../..")

test("it sets a correct type", () => {
  const node = new Identifier()
  assert.deepEqual(node.type, "Identifier")
})

test("it assigns additional properties", () => {
  const node = new Identifier({ name: "foo" })
  assert.deepEqual(node.name, "foo")
})

test("it supports a shorthand syntax", () => {
  const node = new Identifier("foo")
  assert.deepEqual(node.name, "foo")
})
