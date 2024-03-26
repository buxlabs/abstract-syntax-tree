const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it removes nodes", () => {
  const ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: "Literal", value: "use strict" })
  assert(ast.source === "var b = 4;\n")
})

test("it removes function declarations", () => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: "FunctionDeclaration",
    id: {
      type: "Identifier",
      name: "hello",
    },
  })
  assert(ast.source === "var a = 1;\n")
})

test("it keeps variable declarations", () => {
  const source = 'var a = 1, b = 2; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: "VariableDeclarator",
    id: {
      type: "Identifier",
      name: "a",
    },
  })
  assert(
    ast.source === 'var b = 2;\nfunction hello() {\n  return "world";\n}\n'
  )
})

test("it removes empty declarations", () => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: "VariableDeclarator",
    id: {
      type: "Identifier",
      name: "a",
    },
  })
  assert(ast.source === 'function hello() {\n  return "world";\n}\n')
})

test("it removes nodes if string is provided", () => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove("VariableDeclaration")
  assert.deepEqual(ast.source, 'function hello() {\n  return "world";\n}\n')
})

test("it should be possible to remove the first element only", () => {
  const source = "var a = 1; var b = 2;"
  const ast = new AbstractSyntaxTree(source)
  ast.remove({ type: "VariableDeclaration" }, { first: true })
  assert(ast.source === "var b = 2;\n")
})

test("it lets you remove empty statements", () => {
  const tree = new AbstractSyntaxTree("var a = 1;;")
  assert.deepEqual(tree.source, "var a = 1;\n;\n")
  tree.remove({ type: "EmptyStatement" })
  assert.deepEqual(tree.source, "var a = 1;\n")
})

test("it lets you define a callback", () => {
  const tree = new AbstractSyntaxTree("var a = 1;;")
  tree.remove((node) => {
    if (node.type === "EmptyStatement") return null
    return node
  })
  assert.deepEqual(tree.source, "var a = 1;\n")
})

test("it lets you define a callback with a parent", () => {
  const tree = new AbstractSyntaxTree("var a = [1, 2]")
  tree.remove((node, parent) => {
    if (node.type === "Literal" && parent.type === "ArrayExpression")
      return null
    return node
  })
  assert.deepEqual(tree.source, "var a = [];\n")
})

test("it removes empty declarations in the callback form", () => {
  const source = 'var a = 1; function hello () { return "world"; }'
  const ast = new AbstractSyntaxTree(source)
  ast.remove((node) => {
    if (node.type === "VariableDeclarator" && node.id.name === "a") return null
    return node
  })
  assert(ast.source === 'function hello() {\n  return "world";\n}\n')
})
