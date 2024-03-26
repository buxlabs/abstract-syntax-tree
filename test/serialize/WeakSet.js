const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: WeakSet", () => {
  assert.deepEqual(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakSet",
      },
      arguments: [],
    }),
    new WeakSet()
  )

  assert.deepEqual(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakSet",
      },
      arguments: [{ type: "ObjectExpression", properties: [] }],
    }),
    new WeakSet([{}])
  )
})
