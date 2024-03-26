const test = require("node:test")
const assert = require("node:assert")
const { generate, first, parse } = require("../../..")

test("async-await: can be parsed and generated", () => {
  const source = `
    async function foo () {}

    (async () => {
      await foo()
    })
  `
  const tree = parse(source)
  assert(first(tree, "AwaitExpression"))
  assert(first(tree, "[async=true]"))
  const output = generate(tree)
  assert(output)
})
