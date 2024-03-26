const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Symbol", () => {
  assert.deepEqual(
    serialize({
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "Symbol",
      },
      arguments: [{ type: "Literal", value: 42 }],
    }).toString(),
    "Symbol(42)"
  )
})
