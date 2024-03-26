const test = require("node:test")
const assert = require("node:assert")
const { CallExpression } = require("../..")

test("it sets a correct type", () => {
  const node = new CallExpression()
  assert.deepEqual(node.type, "CallExpression")
})

test("it accepts options", () => {
  const node = new CallExpression({
    callee: { type: "Identifier", name: "foo" },
    arguments: [{ type: "Identifier", name: "bar" }],
  })
  assert.deepEqual(node.callee.type, "Identifier")
  assert.deepEqual(node.callee.name, "foo")
})

test("it works with a shorthand syntax", () => {
  const node = new CallExpression("foo", ["bar"])
  assert.deepEqual(node.callee.type, "Identifier")
  assert.deepEqual(node.callee.name, "foo")
})
