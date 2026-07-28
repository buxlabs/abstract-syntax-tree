const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")
const { parse, generate, prune } = AbstractSyntaxTree

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()
const run = (source) => {
  const tree = parse(source)
  prune(tree)
  return output(tree)
}

// ---------------------------------------------------------------------------
// basics
// ---------------------------------------------------------------------------

test("prune: removes an unused variable declaration", () => {
  assert.equal(run("const used = 1; const unused = 2; used"), "const used = 1; used;")
})

test("prune: keeps a used variable declaration", () => {
  assert.equal(run("const a = 1; a"), "const a = 1; a;")
})

test("prune: removes an unused declarator but keeps the used ones", () => {
  assert.equal(run("const a = 1, b = 2, c = 3; a + c"), "const a = 1, c = 3; a + c;")
})

test("prune: removes an unused function declaration", () => {
  assert.equal(run("function used () {} function dead () {} used()"), "function used() {} used();")
})

test("prune: removes an unused var declaration", () => {
  assert.equal(run("var a = 1"), "")
})

test("prune: keeps a declaration with no initializer only when referenced", () => {
  assert.equal(run("let a; a"), "let a; a;")
  assert.equal(run("let a;"), "")
})

test("prune: is available as an instance method", () => {
  const tree = new AbstractSyntaxTree("const a = 1; const dead = 2; a")
  tree.prune()
  assert.equal(output(tree._tree), "const a = 1; a;")
})

test("prune: is available as a static method", () => {
  assert.equal(typeof AbstractSyntaxTree.prune, "function")
})

test("prune: returns the tree", () => {
  const tree = parse("const a = 1")
  assert.equal(prune(tree), tree)
})

// ---------------------------------------------------------------------------
// cascading elimination
// ---------------------------------------------------------------------------

test("prune: removes a chain of bindings that become unused", () => {
  assert.equal(run("const a = 1; const b = a; const c = b"), "")
})

test("prune: removes an unused function and the bindings it referenced", () => {
  assert.equal(run("const value = 1; function dead () { return value }"), "")
})

test("prune: stops the cascade at an impure initializer", () => {
  assert.equal(run("const a = sideEffect(); const b = a"), "const a = sideEffect();")
})

// ---------------------------------------------------------------------------
// side effects are preserved
// ---------------------------------------------------------------------------

test("prune: keeps an initializer that calls a function", () => {
  assert.equal(run("const x = compute()"), "const x = compute();")
})

test("prune: keeps an initializer that constructs an object", () => {
  assert.equal(run("const x = new Thing()"), "const x = new Thing();")
})

test("prune: keeps an initializer that reads a member (possible getter)", () => {
  assert.equal(run("const x = obj.prop"), "const x = obj.prop;")
})

test("prune: keeps an initializer that spreads a value", () => {
  assert.equal(run("const x = [...items]"), "const x = [...items];")
})

test("prune: keeps an initializer that awaits", () => {
  assert.equal(
    run("async function f () { const x = await value } f()"),
    "async function f() { const x = await value; } f();"
  )
})

test("prune: keeps an assignment initializer", () => {
  assert.equal(run("let a; const b = (a = 1)"), "let a; const b = a = 1;")
})

// ---------------------------------------------------------------------------
// pure initializers are removed
// ---------------------------------------------------------------------------

test("prune: removes a pure arithmetic initializer", () => {
  assert.equal(run("const x = 1 + 2 * 3"), "")
})

test("prune: removes a pure object and array initializer", () => {
  assert.equal(run("const x = { a: 1, b: [1, 2], c: { d: 3 } }"), "")
})

test("prune: removes a pure function expression initializer", () => {
  assert.equal(run("const x = () => compute()"), "")
})

test("prune: removes a conditional of pure operands", () => {
  assert.equal(run("const x = flag ? 1 : 2"), "")
})

test("prune: removes a template literal with pure expressions", () => {
  assert.equal(run("const x = `a${1}b${c}`"), "")
})

test("prune: removes a typeof expression", () => {
  assert.equal(run("const x = typeof y"), "")
})

test("prune: removes a logical expression of pure operands", () => {
  assert.equal(run("const x = a && b || c"), "")
})

test("prune: removes a sequence of pure expressions", () => {
  assert.equal(run("const x = (1, 2, 3)"), "")
})

test("prune: keeps a template literal with an impure expression", () => {
  assert.equal(run("const x = `a${f()}b`"), "const x = `a${f()}b`;")
})

test("prune: keeps a delete expression", () => {
  assert.equal(run("const x = delete obj.prop"), "const x = delete obj.prop;")
})

test("prune: keeps a sequence with an impure expression", () => {
  assert.equal(run("const x = (f(), 2)"), "const x = (f(), 2);")
})

test("prune: keeps a unary expression with an impure argument", () => {
  assert.equal(run("const x = !f()"), "const x = !f();")
})

// ---------------------------------------------------------------------------
// things that must not be pruned
// ---------------------------------------------------------------------------

test("prune: keeps a write only binding", () => {
  assert.equal(run("let x; x = 1"), "let x; x = 1;")
})

test("prune: keeps a destructuring declaration", () => {
  assert.equal(run("const { a, b } = obj; a"), "const {a, b} = obj; a;")
})

test("prune: keeps a self referential function", () => {
  assert.equal(run("function recur () { return recur() }"), "function recur() { return recur(); }")
})

test("prune: keeps a loop variable in a for of statement", () => {
  assert.equal(run("for (const item of items) {}"), "for (const item of items) {}")
})

test("prune: keeps a loop variable in a for statement", () => {
  assert.equal(run("for (let i = 0; i < 10; i += 1) {}"), "for (let i = 0; i < 10; i += 1) {}")
})

test("prune: keeps a catch parameter", () => {
  assert.equal(run("try { f() } catch (error) {}"), "try { f(); } catch (error) {}")
})

test("prune: keeps a function parameter", () => {
  assert.equal(run("function f (unused) { return 1 } f()"), "function f(unused) { return 1; } f();")
})

test("prune: keeps an unused class declaration", () => {
  assert.equal(run("class A {}"), "class A {}")
})

test("prune: keeps an unused import", () => {
  assert.equal(run('import foo from "x"'), 'import foo from "x";')
})

// ---------------------------------------------------------------------------
// exported declarations are kept
// ---------------------------------------------------------------------------

test("prune: keeps an exported variable", () => {
  assert.equal(run("export const answer = 42"), "export const answer = 42;")
})

test("prune: keeps an exported function", () => {
  assert.equal(run("export function f () {}"), "export function f() {}")
})

test("prune: keeps a default exported function", () => {
  assert.equal(run("export default function foo () {}"), "export default function foo() {}")
})

test("prune: keeps a binding referenced by an export specifier", () => {
  assert.equal(run("const a = 1; const dead = 2; export { a }"), "const a = 1; export {a};")
})

// ---------------------------------------------------------------------------
// structural safety
// ---------------------------------------------------------------------------

test("prune: does not remove a declaration from an unbraced if", () => {
  assert.equal(run("if (x) var y = 1"), "if (x) var y = 1;")
})

test("prune: does not remove a declaration from an unbraced loop body", () => {
  assert.equal(run("while (x) var y = 1"), "while (x) var y = 1;")
})

test("prune: removes dead code inside a function body", () => {
  assert.equal(run("function f () { const dead = 1; return 2 } f()"), "function f() { return 2; } f();")
})

test("prune: removes dead code inside a block", () => {
  assert.equal(run("if (x) { const dead = 1 }"), "if (x) {}")
})

test("prune: removes dead code inside a switch case", () => {
  assert.equal(run("switch (x) { case 1: const dead = 1; }"), "switch (x) { case 1: }")
})

test("prune: handles an empty program", () => {
  assert.equal(run(""), "")
})

// ---------------------------------------------------------------------------
// scopes
// ---------------------------------------------------------------------------

test("prune: keeps an outer binding used only by an inner scope", () => {
  assert.equal(
    run("const a = 1; function f () { return a } f()"),
    "const a = 1; function f() { return a; } f();"
  )
})

test("prune: removes an unused binding that shadows a used one", () => {
  assert.equal(
    run("const a = 1; function f () { const a = 2; return 3 } f(); a"),
    "const a = 1; function f() { return 3; } f(); a;"
  )
})
