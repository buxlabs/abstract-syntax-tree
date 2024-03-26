const test = require("node:test")
const assert = require("node:assert")
const { Node } = require("../..")

test("it sets a correct type", () => {
  const node = new Node()
  assert.deepEqual(node.type, "Node")
})
