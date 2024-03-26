const test = require("node:test")
const assert = require("node:assert")
const { ClassBody } = require("../..")

test("it sets a correct type", () => {
  const node = new ClassBody()
  assert.deepEqual(node.type, "ClassBody")
})
