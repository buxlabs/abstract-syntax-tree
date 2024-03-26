const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it lets you set the body of the program", () => {
  const tree = new AbstractSyntaxTree()
  tree.body = [
    {
      type: "ExpressionStatement",
      expression: {
        type: "Literal",
        value: "use strict",
      },
    },
  ]
  assert.deepEqual(tree.source, '"use strict";\n')
})
