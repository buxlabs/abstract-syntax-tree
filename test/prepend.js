const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it prepends nodes to the body", () => {
  const tree = new AbstractSyntaxTree("const a = 1")
  tree.prepend({
    type: "ExpressionStatement",
    expression: {
      type: "Literal",
      value: "use strict",
    },
  })
  assert.deepEqual(tree.source, '"use strict";\nconst a = 1;\n')
})

test("it prepends source to the body", () => {
  const tree = new AbstractSyntaxTree("const a = 1")
  tree.prepend('"use strict"')
  assert.deepEqual(tree.source, '"use strict";\nconst a = 1;\n')
})

test("it prepends multiple nodes", () => {
  const tree = new AbstractSyntaxTree("const a = 1")
  tree.prepend([
    {
      type: "ExpressionStatement",
      expression: {
        type: "Literal",
        value: "foo",
      },
    },
    {
      type: "ExpressionStatement",
      expression: {
        type: "Literal",
        value: "bar",
      },
    },
  ])
  assert.deepEqual(tree.source, '"foo";\n"bar";\nconst a = 1;\n')
})

test("it is exposed as a static method", () => {
  const { parse, prepend, generate } = AbstractSyntaxTree
  const tree = parse("const a = 1")
  prepend(tree, '"use strict"')
  assert.deepEqual(generate(tree), '"use strict";\nconst a = 1;\n')
})

test("it prepends nodes to an array", () => {
  const { prepend, generate } = AbstractSyntaxTree
  const body = []
  prepend(body, '"use strict"')
  const tree = { type: "Program", body }
  assert.deepEqual(generate(tree), '"use strict";\n')
})

test("it prepends nodes to the body of given node", () => {
  const { prepend, generate } = AbstractSyntaxTree
  const tree = { type: "Program", body: [] }
  prepend(tree, '"use strict"')
  assert.deepEqual(generate(tree), '"use strict";\n')
})

test("is a noop for nodes without body", () => {
  const { prepend, generate } = AbstractSyntaxTree
  const literal = { type: "Literal", value: 42 }
  prepend(literal, '"use strict"')
  const tree = {
    type: "Program",
    body: [{ type: "ExpressionStatement", expression: literal }],
  }
  assert.deepEqual(generate(tree), "42;\n")
})
