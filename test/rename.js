const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")
const { parse, generate, rename, scope } = AbstractSyntaxTree
const { runInNewContext } = require("node:vm")

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()
const evaluate = (tree) => runInNewContext(generate(tree))

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

// ---------------------------------------------------------------------------
// scope option
// ---------------------------------------------------------------------------

test("rename: renames every scope by default", () => {
  const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
  rename(tree, "foo", "bar", { scope: "all" })
  assert.equal(output(tree), "let bar = 1; function f() { let bar = 2; return bar; } bar;")
})

test("rename: scope top renames only the root binding", () => {
  const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
  rename(tree, "foo", "renamed", { scope: "top" })
  assert.equal(output(tree), "let renamed = 1; function f() { let foo = 2; return foo; } renamed;")
})

test("rename: scope top ignores a name declared only in an inner scope", () => {
  const tree = parse("function f () { let foo = 1; return foo }")
  rename(tree, "foo", "bar", { scope: "top" })
  assert.equal(output(tree), "function f() { let foo = 1; return foo; }")
})

test("rename: a scope renames only the binding declared in it", () => {
  const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
  const root = scope(tree)
  rename(tree, "foo", "inner", { scope: root.children[0] })
  assert.equal(output(tree), "let foo = 1; function f() { let inner = 2; return inner; } foo;")
})

test("rename: is available as an instance method with options", () => {
  const tree = new AbstractSyntaxTree("let foo = 1; function f () { let foo = 2; return foo }")
  tree.rename("foo", "bar", { scope: "top" })
  assert.equal(output(tree._tree), "let bar = 1; function f() { let foo = 2; return foo; }")
})

test("rename: throws for a scope analyzed from a different tree", () => {
  const tree = parse("let foo = 1")
  const other = scope(parse("let foo = 2"))
  assert.throws(() => rename(tree, "foo", "bar", { scope: other }), /different tree/)
})

test("rename: throws for an unknown scope option", () => {
  const tree = parse("let foo = 1")
  assert.throws(() => rename(tree, "foo", "bar", { scope: "nope" }), /Invalid scope option/)
})

// ---------------------------------------------------------------------------
// capture
// ---------------------------------------------------------------------------

test("rename: throws when a reference would be captured by an inner declaration", () => {
  const tree = parse("const foo = 1; function f () { const bar = 2; return foo }")
  assert.throws(() => rename(tree, "foo", "bar"), /would be captured/)
})

test("rename: throws when the renamed binding would shadow an existing reference", () => {
  const tree = parse("const bar = 1; function f () { const foo = 2; return bar }")
  assert.throws(() => rename(tree, "foo", "bar"), /would be shadowed/)
})

test("rename: throws when the renamed binding would shadow a global", () => {
  const tree = parse("function f () { const foo = 1; return bar }")
  assert.throws(() => rename(tree, "foo", "bar"), /would be shadowed/)
})

test("rename: does not mutate the tree when a capture is rejected", () => {
  const tree = parse("const foo = 1; function f () { const bar = 2; return foo }")
  assert.throws(() => rename(tree, "foo", "bar"))
  assert.equal(output(tree), "const foo = 1; function f() { const bar = 2; return foo; }")
})

test("rename: preserves the value of a reference that reaches past an inner scope", () => {
  const tree = parse("const foo = 1; function f () { const other = 2; return foo } f()")
  const before = evaluate(tree)
  rename(tree, "foo", "renamed")
  assert.equal(before, 1)
  assert.equal(evaluate(tree), before)
})

test("rename: preserves the value of a shadowed binding renamed at the top", () => {
  const tree = parse("let foo = 1; function f () { let foo = 2; return foo } f() + foo")
  const before = evaluate(tree)
  rename(tree, "foo", "renamed", { scope: "top" })
  assert.equal(before, 3)
  assert.equal(evaluate(tree), before)
})

// ---------------------------------------------------------------------------
// classes
// ---------------------------------------------------------------------------

test("rename: renames a class and its self reference", () => {
  const tree = parse("class Foo { m () { return Foo } }")
  rename(tree, "Foo", "Bar")
  assert.equal(output(tree), "class Bar { m() { return Bar; } }")
})

test("rename: renames a class self reference when targeting the root scope", () => {
  const tree = parse("class Foo { m () { return Foo } } new Foo()")
  rename(tree, "Foo", "Bar", { scope: "top" })
  assert.equal(output(tree), "class Bar { m() { return Bar; } } new Bar();")
})

test("rename: keeps a renamed class constructible", () => {
  const tree = parse("class Foo { m () { return Foo.name } } new Foo().m()")
  rename(tree, "Foo", "Bar")
  assert.equal(evaluate(tree), "Bar")
})

test("rename: allows a name used only outside the binding's scope", () => {
  const tree = parse("function f (foo) { return foo } bar()")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "function f(bar) { return bar; } bar();")
})

test("rename: allows sibling scopes to reuse the same name", () => {
  const tree = parse("function a () { let foo = 1; return foo } function b () { let bar = 2; return bar }")
  rename(tree, "foo", "bar")
  assert.equal(
    output(tree),
    "function a() { let bar = 1; return bar; } function b() { let bar = 2; return bar; }"
  )
})

test("rename: does not treat a property key as a conflicting reference", () => {
  const tree = parse("const foo = 1; obj.bar; foo")
  rename(tree, "foo", "bar")
  assert.equal(output(tree), "const bar = 1; obj.bar; bar;")
})
