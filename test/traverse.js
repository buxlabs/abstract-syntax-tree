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

// regression tests for V-001 (prototype pollution via traverse's `keys` option)

test("it does not pollute Object.prototype when keys option has an own __proto__ property", () => {
  const { traverse } = AbstractSyntaxTree
  const tree = { type: "Program", body: [] }
  const maliciousKeys = {}
  Object.defineProperty(maliciousKeys, "__proto__", {
    value: { polluted: ["polluted"] },
    enumerable: true,
    configurable: true,
  })
  traverse(tree, {
    keys: maliciousKeys,
    enter() {},
  })
  assert.strictEqual(Object.prototype.polluted, undefined)
  assert.strictEqual({}.polluted, undefined)
})

test("it does not pollute Object.prototype when keys option has a constructor property", () => {
  const { traverse } = AbstractSyntaxTree
  const tree = { type: "Program", body: [] }
  traverse(tree, {
    keys: { constructor: ["polluted"] },
    enter() {},
  })
  assert.strictEqual(Object.prototype.polluted, undefined)
  assert.strictEqual({}.polluted, undefined)
})

test("it does not pollute Object.prototype when keys option has a prototype property", () => {
  const { traverse } = AbstractSyntaxTree
  const tree = { type: "Program", body: [] }
  traverse(tree, {
    keys: { prototype: ["polluted"] },
    enter() {},
  })
  assert.strictEqual(Object.prototype.polluted, undefined)
  assert.strictEqual({}.polluted, undefined)
})

test("it still merges legitimate custom keys and visits their children", () => {
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
      visited.push(node.type + (node.name ? ":" + node.name : ""))
    },
  })
  assert.deepEqual(visited, ["CustomNode", "Identifier:a", "Identifier:b"])
})

test("it still falls back to default visitor keys for standard node types when a custom keys option is supplied", () => {
  const { parse, traverse } = AbstractSyntaxTree
  const visited = []
  const tree = parse("var a = 1;")
  traverse(tree, {
    keys: { CustomNode: ["children"] },
    enter(node) {
      visited.push(node.type)
    },
  })
  assert.ok(visited.includes("VariableDeclaration"))
  assert.ok(visited.includes("VariableDeclarator"))
  assert.ok(visited.includes("Identifier"))
  assert.ok(visited.includes("Literal"))
})
