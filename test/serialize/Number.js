const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Number", () => {
  assert.deepEqual(serialize({ type: "Literal", value: 42 }), 42)
  assert.deepEqual(serialize({ type: "Literal", value: -1 }), -1)
  assert.deepEqual(serialize({ type: "Literal", value: 0 }), 0)
  assert.deepEqual(serialize({ type: "Literal", value: 1 }), 1)
  assert.deepEqual(serialize({ type: "Literal", value: -0.1 }), -0.1)
  assert.deepEqual(serialize({ type: "Literal", value: 0.0 }), 0.0)
  assert.deepEqual(serialize({ type: "Literal", value: 0.1 }), 0.1)
})
