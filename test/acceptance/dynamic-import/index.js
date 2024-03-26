const test = require("node:test")
const assert = require("node:assert")
const { generate, first, parse } = require("../../..")

test("dynamic-import: can be parsed", () => {
  const source = `
    import('foo.js')
      .then(function (bar) {
        bar.baz()
      })
  `
  const tree = parse(source)
  const node = first(tree, "ImportExpression")
  assert(node)
})

test("dynamic-import: can be generated", () => {
  const source = `
    import('foo.js')
      .then(function (bar) {
        bar.baz()
      })
  `
  const tree = parse(source)
  const output = generate(tree)
  assert(output.includes('import("foo.js").then('))
})
