const test = require("node:test")
const assert = require("node:assert")
const { UnaryExpression, Literal } = require("../..")

test("it sets a correct type", () => {
  const node = new UnaryExpression()
  assert.deepEqual(node.type, "UnaryExpression")
})

test("it sets correct data", () => {
  const node = new UnaryExpression({
    operator: "void",
    argument: new Literal(0),
    prefix: true,
  })
  assert.deepEqual(node.operator, "void")
  assert.deepEqual(node.argument, new Literal(0))
})
