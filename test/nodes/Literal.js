const test = require("node:test")
const assert = require("node:assert")
const { Literal } = require("../..")

test("it sets a correct type", () => {
  const node = new Literal()
  assert.deepEqual(node.type, "Literal")
})

test("it assigns additional properties", () => {
  const node = new Literal({ value: "foo" })
  assert.deepEqual(node.value, "foo")
})

test("it supports the shorthand syntax for strings", () => {
  const node = new Literal("foo")
  assert.deepEqual(node.value, "foo")
})

test("it supports the shorthand syntax for numbers", () => {
  const node = new Literal(0)
  assert.deepEqual(node.value, 0)
})

test("it supports the shorthand syntax for null", () => {
  const node = new Literal(null)
  assert.deepEqual(node.value, null)
})

test("it supports regexp", () => {
  const node = new Literal(/[abc]+/gi)
  assert.deepEqual(node.value, {})
  assert.deepEqual(node.regex.pattern, "[abc]+")
  assert.deepEqual(node.regex.flags, "gi")
})

test("it supports the shorthand syntax for true", () => {
  const node = new Literal(true)
  assert.deepEqual(node.value, true)
})

test("it supports the shorthand syntax for false", () => {
  const node = new Literal(false)
  assert.deepEqual(node.value, false)
})

test("it supports the shorthand syntax for undefined", () => {
  const node = new Literal(undefined)
  assert.deepEqual(node.value, undefined)
})
