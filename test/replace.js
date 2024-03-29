const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it can be used with a callback syntax", () => {
  const source = "const a = 1"
  const tree = new AbstractSyntaxTree(source)
  tree.replace((node) => {
    if (node.type === "VariableDeclaration") {
      node.kind = "var"
    }
    return node
  })
  assert.deepEqual(tree.source, "var a = 1;\n")
})

test("it replaces nodes on enter", () => {
  const source = "const a = 1"
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    enter(node) {
      if (node.type === "VariableDeclaration") {
        node.kind = "let"
      }
      return node
    },
  })
  assert.deepEqual(tree.source, "let a = 1;\n")
})

test("it replaces nodes on leave", () => {
  const source = "const a = 1"
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave(node) {
      if (node.type === "VariableDeclaration") {
        node.kind = "let"
      }
      return node
    },
  })
  assert.deepEqual(tree.source, "let a = 1;\n")
})

test("it can replace given node with multiple nodes", () => {
  const source = '"foo";"bar";'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave(node) {
      if (
        node.type === "ExpressionStatement" &&
        node.expression.type === "Literal" &&
        node.expression.value === "bar"
      ) {
        return [
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: "baz" },
          },
          {
            type: "ExpressionStatement",
            expression: { type: "Literal", value: "qux" },
          },
        ]
      }
      return node
    },
  })
  assert.deepEqual(tree.source, '"foo";\n"baz";\n"qux";\n')
})

test("it can remove given node", () => {
  const source = '"foo";"bar";'
  const tree = new AbstractSyntaxTree(source)
  tree.replace({
    leave(node) {
      if (
        node.type === "ExpressionStatement" &&
        node.expression.type === "Literal" &&
        node.expression.value === "bar"
      ) {
        return null
      }
      return node
    },
  })
  assert.deepEqual(tree.source, '"foo";\n')
})

test("it lets you convert nodes to jsx", () => {
  const source = '"foo";'
  const tree = new AbstractSyntaxTree(source)
  tree.replace((node) => {
    if (node.type === "Literal") {
      return {
        type: "JSXElement",
        openingElement: {
          type: "JSXOpeningElement",
          attributes: [],
          name: {
            type: "JSXIdentifier",
            name: "div",
          },
        },
      }
    }
    return node
  })
  assert.deepEqual(tree.source.trim(), "<div />;")
})
