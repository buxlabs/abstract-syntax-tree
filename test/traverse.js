const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it lets you traverse over the tree", () => {
  const source = "var a = 1;"
  const tree = new AbstractSyntaxTree(source)
  tree.traverse({
    enter(node) {
      if (node.type === "VariableDeclaration") {
        node.kind = "const"
      }
      return node
    },
  })
  assert.deepEqual(tree.source, "const a = 1;\n")
})

test("it is exposed as a static method", () => {
  const { parse, traverse, generate } = AbstractSyntaxTree
  const tree = parse("var a = 1")
  traverse(tree, {
    enter(node) {
      if (node.type === "VariableDeclaration") {
        node.kind = "const"
      }
      return node
    },
  })
  assert.deepEqual(generate(tree), "const a = 1;\n")
})

// ---------------------------------------------------------------------------
// the keys option
// ---------------------------------------------------------------------------

test("it visits the children named by a custom key", () => {
  const { traverse } = AbstractSyntaxTree
  const visited = []
  const tree = {
    type: "CustomNode",
    children: [
      { type: "Identifier", name: "a" },
      { type: "Identifier", name: "b" },
    ],
  }
  traverse(tree, {
    keys: { CustomNode: ["children"] },
    enter(node) {
      visited.push(node.name || node.type)
    },
  })
  assert.deepEqual(visited, ["CustomNode", "a", "b"])
})

test("it keeps the default keys for node types the visitor does not mention", () => {
  const { parse, traverse } = AbstractSyntaxTree
  const visited = []
  const tree = parse("var a = 1")
  traverse(tree, {
    keys: { CustomNode: ["children"] },
    enter(node) {
      visited.push(node.type)
    },
  })
  assert.deepEqual(visited, [
    "Program",
    "VariableDeclaration",
    "VariableDeclarator",
    "Identifier",
    "Literal",
  ])
})

test("it lets a custom key override a default one", () => {
  const { traverse } = AbstractSyntaxTree
  const visited = []
  const tree = {
    type: "Program",
    body: [{ type: "Identifier", name: "skipped" }],
    extra: [{ type: "Identifier", name: "visited" }],
  }
  traverse(tree, {
    keys: { Program: ["extra"] },
    enter(node) {
      visited.push(node.name || node.type)
    },
  })
  assert.deepEqual(visited, ["Program", "visited"])
})

// `__proto__` is the one key name that assignment treats specially, because
// setting it reaches the accessor on Object.prototype. Merging has to store it
// like any other name instead.
test("it keeps the default keys when the keys option has an own __proto__ property", () => {
  const { parse, traverse } = AbstractSyntaxTree
  const keys = {}
  Object.defineProperty(keys, "__proto__", {
    value: { Program: ["nowhere"] },
    enumerable: true,
    configurable: true,
  })
  const visited = []
  traverse(parse("var a = 1"), {
    keys,
    enter(node) {
      visited.push(node.type)
    },
  })
  assert.ok(visited.includes("VariableDeclaration"))
  assert.equal(Object.prototype.Program, undefined)
})

test("it keeps a key named constructor", () => {
  const { traverse } = AbstractSyntaxTree
  const visited = []
  const tree = { type: "constructor", parts: [{ type: "Identifier", name: "a" }] }
  traverse(tree, {
    keys: { constructor: ["parts"] },
    enter(node) {
      visited.push(node.name || node.type)
    },
  })
  assert.deepEqual(visited, ["constructor", "a"])
})
