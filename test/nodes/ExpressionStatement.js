const test = require("node:test")
const assert = require("node:assert")
const { ExpressionStatement } = require("../..")

test("it sets a correct type", () => {
  const node = new ExpressionStatement()
  assert.deepEqual(node.type, "ExpressionStatement")
})

test("it sets expression to null", () => {
  const node = new ExpressionStatement()
  assert.deepEqual(node.expression, null)
})

test("it assigns options", () => {
  const node = new ExpressionStatement({
    expression: {
      type: "Literal",
      value: "use strict",
    },
  })
  assert.deepEqual(node.expression, { type: "Literal", value: "use strict" })
})
