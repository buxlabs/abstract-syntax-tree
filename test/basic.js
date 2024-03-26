const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")

test("it accepts source", () => {
  assert(new AbstractSyntaxTree("var x = 0;"))
})

test("it accepts abstract syntax tree", () => {
  assert(
    new AbstractSyntaxTree({
      type: "Program",
      body: [
        {
          type: "FunctionDeclaration",
          id: { type: "Identifier", name: "foo" },
          params: [],
          body: { type: "BlockStatement", body: [] },
        },
      ],
    })
  )
})

test("it queries the syntax tree", () => {
  const ast = new AbstractSyntaxTree("var y = 1;")
  const declarations = ast.find("VariableDeclaration")
  assert(declarations.length === 1)
})

test("it iterates over found nodes", () => {
  const ast = new AbstractSyntaxTree("var y = 1;")
  ast.each("Literal", (node) => {
    node.value = 2
  })
  assert(ast.first("Literal").value === 2)
})

test("it checks if node is in the syntax tree", () => {
  const ast = new AbstractSyntaxTree("var z = 2;")
  assert(ast.has("VariableDeclaration"))
})

test("it counts nodes", () => {
  const ast = new AbstractSyntaxTree("var z = 2; var x = 3;")
  assert(ast.count("VariableDeclaration") === 2)
})

test("it returns the source", () => {
  const ast = new AbstractSyntaxTree("var a = 3;")
  assert(ast.source === "var a = 3;\n")
})

test("it returns the first node", () => {
  const ast = new AbstractSyntaxTree("var a = 1; var b = 2;")
  const declaration = ast.first("VariableDeclaration")
  assert(declaration.declarations[0].id.name === "a")
})

test("it returns the last node", () => {
  const ast = new AbstractSyntaxTree("var c = 3; var d = 4;")
  const declaration = ast.last("VariableDeclaration")
  assert(declaration.declarations[0].id.name === "d")
})

test("it works with imports", () => {
  const source = 'import foo from "bar";'
  const ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.source, source + "\n")
})

test("it supports double quotes by default", () => {
  const source = "var a = 'hello';"
  const ast = new AbstractSyntaxTree(source)
  assert(ast.source === 'var a = "hello";\n')
})

test("it walks through nodes", () => {
  const source = "var a = 1;"
  const ast = new AbstractSyntaxTree(source)
  ast.walk((node) => {
    if (node.type === "VariableDeclaration") {
      node.kind = "let"
    }
    return node
  })
  assert.deepEqual(ast.source, "let a = 1;\n")
})

test("it has a toString alias for toSource", () => {
  const ast = new AbstractSyntaxTree("var y = 1;")
  assert(ast.source === "var y = 1;\n")
})

test("it wraps the code", () => {
  const source = "var a = 1;"
  const ast = new AbstractSyntaxTree(source)
  ast.wrap((body) => {
    return [
      {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "FunctionExpression",
            id: null,
            params: [],
            defaults: [],
            body: {
              type: "BlockStatement",
              body,
            },
            rest: null,
            generator: false,
            expression: false,
          },
          arguments: [],
        },
      },
    ]
  })
  assert.deepEqual(ast.source.replace(/\s/g, ""), "(function(){vara=1;})();")
})

test("it unwraps the code in case of iife", () => {
  const source = "(function () { console.log(1); }());"
  const ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert(ast.source === "console.log(1);\n")
})

test("it unwraps code in case of amd", () => {
  const source = "define(function () { console.log(1); });"
  const ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert(ast.source === "console.log(1);\n")
})

test("it returns the type", () => {
  const source = "var a = 1;"
  const ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.type, "Program")
})

test("it returns the body", () => {
  const source = "var a = 1;"
  const ast = new AbstractSyntaxTree(source)
  assert(ast.body)
})

test("it generates sourcemaps", () => {
  const ast = new AbstractSyntaxTree("var y = 1;")
  ast.each("Literal", (node) => {
    node.value = 2
  })
  assert(ast.first("Literal").value === 2)
  assert.deepEqual(
    ast.map,
    '{"version":3,"sources":["UNKNOWN"],"names":["y"],"mappings":"IAAIA,IAAI","file":"UNKNOWN"}'
  )
})

test("it lets you mark nodes", () => {
  const ast = new AbstractSyntaxTree("var a = 1;")
  ast.mark()
  assert(ast.first("Program").cid === 1)
  assert(ast.first("VariableDeclaration").cid === 2)
  assert(ast.first("VariableDeclarator").cid === 3)
  assert(ast.first("Identifier").cid === 4)
  assert(ast.first("Literal").cid === 5)
})

test("it handles empty statements", () => {
  const tree = new AbstractSyntaxTree("var a = 1;;")
  assert.deepEqual(tree.find("EmptyStatement").length, 1)
})
