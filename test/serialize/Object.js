const test = require("node:test")
const assert = require("node:assert")
const { serialize } = require("../..")

test("serialize: Object", () => {
  assert.deepEqual(
    serialize({
      type: "ObjectExpression",
      properties: [
        {
          type: "Property",
          key: { type: "Identifier", name: "foo" },
          value: { type: "Literal", value: 42 },
        },
      ],
    }),
    { foo: 42 }
  )

  assert.deepEqual(
    serialize({
      type: "ObjectExpression",
      properties: [
        {
          type: "Property",
          key: { type: "Literal", value: "foo" },
          value: { type: "Literal", value: 42 },
        },
      ],
    }),
    { foo: 42 }
  )

  assert.deepEqual(
    serialize({
      type: "ObjectExpression",
      properties: [
        {
          type: "Property",
          key: { type: "Identifier", name: "foo" },
          value: {
            type: "ObjectExpression",
            properties: [
              {
                type: "Property",
                key: { type: "Identifier", name: "bar" },
                value: { type: "Literal", value: 42 },
              },
            ],
          },
        },
      ],
    }),
    { foo: { bar: 42 } }
  )
})
