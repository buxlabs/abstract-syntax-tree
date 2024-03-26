const test = require("node:test")
const assert = require("node:assert")
const { Program } = require("../..")

test("it sets a correct type", () => {
  const node = new Program()
  assert.deepEqual(node.type, "Program")
})

test("it sets defaults", () => {
  const node = new Program()
  assert.deepEqual(node.sourceType, "script")
  assert.deepEqual(node.body, [])
})
