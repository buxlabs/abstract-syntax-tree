const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")
const { parse, generate, rename } = AbstractSyntaxTree

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()

// ---------------------------------------------------------------------------
// basics
// ---------------------------------------------------------------------------

test("rename: renames a declaration and its references", () => {
  const tree = parse("const foo = 1; foo + foo")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; bar + bar;")
})

test("rename: is available as an instance method", () => {
  const tree = new AbstractSyntaxTree("const foo = 1; foo")
  tree.rename("foo", "bar")
  assert.equal(output(tree._tree), "const bar = 1; bar;")
})

test("rename: is available as a static method", () => {
  assert.equal(typeof AbstractSyntaxTree.rename, "function")
})

test("rename: returns the tree", () => {
  const tree = parse("const foo = 1")
  assert.equal(rename(tree, "foo", "bar"), tree)
})

test("rename: does nothing when the name is unchanged", () => {
  const tree = parse("const foo = 1; foo")
  rename(tree, "foo", "foo")
  assert.equal(output(tree), "const foo = 1; foo;")
})

test("rename: does nothing when the name is not declared", () => {
  const tree = parse("const foo = 1; foo")
  rename(tree, "missing", "bar")
  assert.equal(output(tree), "const foo = 1; foo;")
})

// ---------------------------------------------------------------------------
// identifiers that must not be touched
// ---------------------------------------------------------------------------

test("rename: does not rename member properties", () => {
  const tree = parse("const foo = 1; foo.bar.foo")
  rename(tree, "foo", "renamed")
  assert.equal(output(tree), "const renamed = 1; renamed.bar.foo;")
})

test("rename: does not rename object literal keys", () => {
  const tree = parse("const foo = 1; const o = { foo: foo, nested: { foo: 2 } }")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; const o = { foo: bar, nested: { foo: 2 } };")
})

test("rename: renames every binding that shares the name across scopes", () => {
  const tree = parse("const foo = 1; function f (foo) { return foo }")
  rename(tree, "foo", "bar")
  // each foo is a separate binding; both are renamed, each with its own references
  assert.equal(output(tree), "const bar = 1; function f(bar) { return bar; }")
})

test("rename: does not rename labels", () => {
  const tree = parse("const label = 1; outer: for (;;) { break outer } label")
  rename(tree, "label", "renamed")
  assert.equal(output(tree), "const renamed = 1; outer: for (; ; ) { break outer; } renamed;")
})

test("rename: does not rename string or property literals", () => {
  const tree = parse('const foo = 1; const s = "foo"; const o = { "foo": foo }')
  rename(tree, "foo", "bar")
  assert.equal(output(tree), 'const bar = 1; const s = "foo"; const o = { "foo": bar };')
})

// ---------------------------------------------------------------------------
// shorthand expansion
// ---------------------------------------------------------------------------

test("rename: expands a shorthand object property", () => {
  const tree = parse("const foo = 1; const o = { foo }")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; const o = { foo: bar };")
})

test("rename: expands a shorthand destructuring pattern", () => {
  const tree = parse("const { foo } = x; foo")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const {foo: bar} = x; bar;")
})

test("rename: expands a shorthand with a default in a pattern", () => {
  const tree = parse("const { foo = 1 } = x; foo")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const {foo: bar = 1} = x; bar;")
})

test("rename: keeps an unrelated shorthand property intact", () => {
  const tree = parse("const foo = 1; const keep = 2; const o = { foo, keep }")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; const keep = 2; const o = { foo: bar, keep };")
})

// ---------------------------------------------------------------------------
// scopes: shadowing and closures
// ---------------------------------------------------------------------------

test("rename: renames shadowing bindings independently", () => {
  const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
  rename(tree, "foo", "bar")
  assert.equal(
    output(tree),
    "let bar = 1; function f() { let bar = 2; return bar; } bar;"
  )
})

test("rename: renames a binding referenced through a closure", () => {
  const tree = parse("let outer = 1; function f () { return outer }")
  rename(tree, "outer", "renamed")
  assert.equal(output(tree), "let renamed = 1; function f() { return renamed; }")
})

test("rename: renames a function declaration and its recursive references", () => {
  const tree = parse("function foo () { return foo() } foo()")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "function bar() { return bar(); } bar();")
})

test("rename: renames a parameter and its references only", () => {
  const tree = parse("function f (foo) { return foo + 1 }")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "function f(bar) { return bar + 1; }")
})

// ---------------------------------------------------------------------------
// imports and exports
// ---------------------------------------------------------------------------

test("rename: renames an imported binding with an as clause", () => {
  const tree = parse('import { foo } from "x"; foo()')
  rename(tree, "foo", "bar")
  assert.equal(output(tree), 'import {foo as bar} from "x"; bar();')
})

test("rename: renames a default import", () => {
  const tree = parse('import foo from "x"; foo()')
  rename(tree, "foo", "bar")
  assert.equal(output(tree), 'import bar from "x"; bar();')
})

test("rename: renames an exported local with an as clause", () => {
  const tree = parse("const foo = 1; export { foo }")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; export {bar as foo};")
})

// ---------------------------------------------------------------------------
// collisions
// ---------------------------------------------------------------------------

test("rename: throws on a redeclaration collision in the same scope", () => {
  const tree = parse("let foo = 1; let bar = 2")
  assert.throws(() => rename(tree, "foo", "bar"), /already declared/)
})

test("rename: does not mutate the tree when it throws", () => {
  const tree = parse("let foo = 1; let bar = 2")
  assert.throws(() => rename(tree, "foo", "bar"))
  assert.equal(output(tree), "let foo = 1; let bar = 2;")
})

test("rename: allows reusing a name that only exists in a different scope", () => {
  const tree = parse("let foo = 1; function f () { let bar = 2; return bar } foo")
  rename(tree, "foo", "bar")
  assert.equal(
    output(tree),
    "let bar = 1; function f() { let bar = 2; return bar; } bar;"
  )
})
