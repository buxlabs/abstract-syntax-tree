const test = require("node:test")
const assert = require("node:assert")
const { Position } = require("../..")

test("it sets a correct type", () => {
  const node = new Position()
  assert.deepEqual(node.type, "Position")
})
