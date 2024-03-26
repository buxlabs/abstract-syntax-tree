const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it stringifies source", () => {
  const source = AbstractSyntaxTree.generate({
    type: "Program",
    body: [
      {
        type: "ExpressionStatement",
        expression: { type: "Literal", value: "foo" },
      },
    ],
  })
  assert.deepEqual(source.trim(), '"foo";')
})

test("it has an experimental jsx support", () => {
  const source = AbstractSyntaxTree.generate({
    type: "Program",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "JSXElement",
          openingElement: {
            type: "JSXOpeningElement",
            attributes: [],
            name: {
              type: "JSXIdentifier",
              name: "div",
            },
          },
          closingElement: {
            type: "JSXClosingElement",
            attributes: [],
            name: {
              type: "JSXIdentifier",
              name: "div",
            },
          },
          children: [],
        },
      },
    ],
  })
  assert.deepEqual(source.trim(), "<div></div>;")
})
