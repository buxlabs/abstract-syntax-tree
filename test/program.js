const test = require("node:test")
const assert = require("node:assert")
const { program } = require("..")

test("program: creates a abstract syntax tree", () => {
  const tree = program()
  assert.deepEqual(tree, {
    type: "Program",
    sourceType: "module",
    body: [],
  })
})

test("program: accepts a node as a param", () => {
  const body = { type: "Literal", value: "use strict" }
  const tree = program(body)
  assert.deepEqual(tree, {
    type: "Program",
    sourceType: "module",
    body: [body],
  })
})

test("program: accepts an array of nodes as a param", () => {
  const body = [
    { type: "Literal", value: "foo" },
    { type: "Literal", value: "bar" },
  ]
  const tree = program(body)
  assert.deepEqual(tree, {
    type: "Program",
    sourceType: "module",
    body,
  })
})

test("program: accepts options", () => {
  const body = { type: "Literal", value: "use strict" }
  const tree = program(body, { sourceType: "script" })
  assert.deepEqual(tree, {
    type: "Program",
    sourceType: "script",
    body: [body],
  })
})
