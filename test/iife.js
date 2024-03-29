const test = require("node:test")
const assert = require("node:assert")
const { iife, generate } = require("..")

test("iife: creates a abstract syntax tree", () => {
  const tree = iife()
  assert.deepEqual(generate(tree), "(function () {})();")
})

test("iife: accepts a node as a param", () => {
  const body = { type: "Literal", value: "use strict" }
  const tree = iife(body)
  assert.deepEqual(generate(tree), '(function () {\n  "use strict"\n})();')
})

test("iife: accepts an array of nodes as a param", () => {
  const body = [
    { type: "Literal", value: "foo" },
    { type: "Literal", value: "bar" },
  ]
  const tree = iife(body)
  assert.deepEqual(generate(tree), '(function () {\n  "foo"\n  "bar"\n})();')
})
