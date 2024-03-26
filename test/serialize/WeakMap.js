const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: WeakMap", () => {
  assert.deepEqual(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakMap",
      },
      arguments: [],
    }),
    new WeakMap()
  )

  assert.deepEqual(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakMap",
      },
      arguments: [
        {
          type: "ArrayExpression",
          elements: [
            { type: "ObjectExpression", properties: [] },
            { type: "Literal", value: "value1" },
          ],
        },
      ],
    }),
    new WeakMap([[{}, "foo"]])
  )
})
