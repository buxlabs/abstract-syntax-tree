const test = require("node:test")
const assert = require("node:assert")
const { BlockStatement, Literal } = require("../..")

test("it sets a correct type", () => {
  const node = new BlockStatement()
  assert.deepEqual(node.type, "BlockStatement")
})

test("it sets an empty body", () => {
  const node = new BlockStatement()
  assert.deepEqual(node.body, [])
})

test("it accepts options", () => {
  const node = new BlockStatement({ body: [new Literal({ value: "foo" })] })
  assert.deepEqual(node.body[0].type, "Literal")
  assert.deepEqual(node.body[0].value, "foo")
})
