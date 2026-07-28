const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")
const { parse, scope } = AbstractSyntaxTree

const names = (list) => list.map((item) => item.name)
const child = (parent, type) => parent.children.find((item) => item.type === type)

// ---------------------------------------------------------------------------
// structure
// ---------------------------------------------------------------------------

test("scope: returns the root scope of a module", () => {
  const root = scope(parse("const answer = 42"))
  assert.equal(root.type, "module")
  assert.equal(root.parent, null)
  assert.equal(root.node.type, "Program")
})

test("scope: uses a global root scope for scripts", () => {
  const tree = parse("const answer = 42")
  tree.sourceType = "script"
  assert.equal(scope(tree).type, "global")
})

test("scope: handles an empty program", () => {
  const root = scope(parse(""))
  assert.deepEqual(root.bindings, [])
  assert.deepEqual(root.children, [])
  assert.deepEqual(root.globals, [])
})

test("scope: wires parent and children references", () => {
  const root = scope(parse("function f () {}"))
  const inner = root.children[0]
  assert.equal(inner.parent, root)
  assert.equal(root.children.length, 1)
})

test("scope: exposes the root scope from any descendant", () => {
  const root = scope(parse("function f () { function g () {} }"))
  const g = root.children[0].children[0]
  assert.equal(g.root, root)
  assert.equal(root.root, root)
})

test("scope: is available as an instance method", () => {
  const tree = new AbstractSyntaxTree("const answer = 42")
  const root = tree.scope()
  assert.equal(root.type, "module")
  assert.equal(root.getBinding("answer").kind, "const")
})

test("scope: is available as a static method", () => {
  assert.equal(typeof AbstractSyntaxTree.scope, "function")
})

// ---------------------------------------------------------------------------
// bindings
// ---------------------------------------------------------------------------

test("scope: collects top level bindings", () => {
  const root = scope(parse("const a = 1; let b = 2; var c = 3"))
  assert.deepEqual(names(root.bindings), ["a", "b", "c"])
  assert.deepEqual(
    root.bindings.map((binding) => binding.kind),
    ["const", "let", "var"]
  )
})

test("scope: points a binding at its declaration node", () => {
  const root = scope(parse("const a = 1"))
  const binding = root.getBinding("a")
  assert.equal(binding.node.type, "VariableDeclarator")
  assert.equal(binding.identifier.type, "Identifier")
  assert.equal(binding.declarations.length, 1)
})

test("scope: merges redeclared var into one binding with many declarations", () => {
  const root = scope(parse("var a; var a = 1; a"))
  const binding = root.getBinding("a")
  assert.equal(root.bindings.filter((item) => item.name === "a").length, 1)
  assert.equal(binding.declarations.length, 2)
  assert.equal(binding.references.length, 1)
})

test("scope: declares multiple bindings from one declaration", () => {
  const root = scope(parse("let a = 1, b = 2, c = 3"))
  assert.deepEqual(names(root.bindings), ["a", "b", "c"])
})

// ---------------------------------------------------------------------------
// references and resolution
// ---------------------------------------------------------------------------

test("scope: resolves references to their binding", () => {
  const root = scope(parse("const a = 1; a; a"))
  const binding = root.getBinding("a")
  assert.equal(binding.references.length, 2)
  assert.ok(binding.references.every((reference) => reference.binding === binding))
  assert.ok(binding.references.every((reference) => reference.resolved))
})

test("scope: records the scope each reference occurs in", () => {
  const root = scope(parse("const a = 1; function f () { return a }"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.scope.type, "function")
  assert.equal(reference.name, "a")
})

test("scope: records the parent node of a reference", () => {
  const root = scope(parse("const a = 1; a.b"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "MemberExpression")
  assert.equal(reference.parent.object, reference.identifier)
})

test("scope: records the parent for a call callee", () => {
  const root = scope(parse("const f = () => {}; f(1)"))
  const reference = root.getBinding("f").references[0]
  assert.equal(reference.parent.type, "CallExpression")
  assert.equal(reference.parent.callee, reference.identifier)
})

test("scope: records the parent for a call argument", () => {
  const root = scope(parse("const a = 1; f(a)"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "CallExpression")
  assert.equal(reference.parent.arguments[0], reference.identifier)
})

test("scope: records the parent for an assignment target", () => {
  const root = scope(parse("let a; a = 1"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "AssignmentExpression")
})

test("scope: records the parent for a destructuring assignment target", () => {
  const root = scope(parse("let a; [a] = list"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "ArrayPattern")
})

test("scope: records the parent for a declarator initializer reference", () => {
  const root = scope(parse("const a = 1; const b = a"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "VariableDeclarator")
})

test("scope: records the parent for an export specifier reference", () => {
  const root = scope(parse("const a = 1; export { a }"))
  const reference = root.getBinding("a").references[0]
  assert.equal(reference.parent.type, "ExportSpecifier")
})

test("scope: getReference resolves an identifier node to its reference", () => {
  const tree = parse("const a = 1; a")
  const root = scope(tree)
  const identifier = tree.body[1].expression
  const reference = root.getReference(identifier)
  assert.equal(reference.name, "a")
  assert.equal(reference.binding, root.getBinding("a"))
})

test("scope: getReference resolves shadowed uses to the innermost binding", () => {
  const tree = parse("let x = 1; function f () { let x = 2; return x }")
  const root = scope(tree)
  const identifier = tree.body[1].body.body[1].argument
  const reference = root.getReference(identifier)
  assert.equal(reference.binding, root.children[0].getBinding("x"))
})

test("scope: getReference returns an unresolved reference for a global", () => {
  const tree = parse("foo()")
  const root = scope(tree)
  const identifier = tree.body[0].expression.callee
  const reference = root.getReference(identifier)
  assert.equal(reference.name, "foo")
  assert.equal(reference.binding, null)
  assert.equal(reference.resolved, false)
})

test("scope: getReference returns null for a declaration identifier", () => {
  const tree = parse("const a = 1")
  const root = scope(tree)
  const identifier = tree.body[0].declarations[0].id
  assert.equal(root.getReference(identifier), null)
})

test("scope: getReference returns null for a non-reference identifier", () => {
  const tree = parse("const o = { a: 1 }; o.a")
  const root = scope(tree)
  const key = tree.body[0].declarations[0].init.properties[0].key
  const property = tree.body[1].expression.property
  assert.equal(root.getReference(key), null)
  assert.equal(root.getReference(property), null)
})

test("scope: getReference exposes read, write and parent for a use", () => {
  const tree = parse("let a = 1; a = 2")
  const root = scope(tree)
  const identifier = tree.body[1].expression.left
  const reference = root.getReference(identifier)
  assert.equal(reference.write, true)
  assert.equal(reference.read, false)
  assert.equal(reference.parent.type, "AssignmentExpression")
})

test("scope: getReference works from any scope in the tree", () => {
  const tree = parse("const a = 1; function f () { return a }")
  const root = scope(tree)
  const identifier = tree.body[1].body.body[0].argument
  assert.equal(root.children[0].getReference(identifier), root.getReference(identifier))
})

test("scope: getReference round trips with a binding's references", () => {
  const tree = parse("const a = 1; a; a.b")
  const root = scope(tree)
  const binding = root.getBinding("a")
  for (const reference of binding.references) {
    assert.equal(root.getReference(reference.identifier), reference)
  }
})

test("scope: keeps references directly on the scope they occur in", () => {
  const root = scope(parse("a; function f () { b }"))
  assert.deepEqual(names(root.references), ["a"])
  assert.deepEqual(names(root.children[0].references), ["b"])
})

test("scope: resolves references before their declaration", () => {
  const root = scope(parse("a; let a = 1"))
  assert.equal(root.getBinding("a").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: does not resolve declarations to references of themselves", () => {
  const root = scope(parse("let a = a"))
  // the initializer reads the binding being declared
  assert.equal(root.getBinding("a").references.length, 1)
})

// ---------------------------------------------------------------------------
// globals
// ---------------------------------------------------------------------------

test("scope: collects unresolved references as globals", () => {
  const root = scope(parse("console.log(answer)"))
  assert.deepEqual(names(root.globals), ["console", "answer"])
})

test("scope: aggregates every reference of a global", () => {
  const root = scope(parse("foo(); foo(); foo()"))
  assert.equal(root.globals.length, 1)
  assert.equal(root.globals[0].references.length, 3)
})

test("scope: reports a global only on the root scope", () => {
  const root = scope(parse("function f () { missing() }"))
  assert.deepEqual(names(root.globals), ["missing"])
  assert.deepEqual(root.children[0].globals, [])
})

// ---------------------------------------------------------------------------
// dead code elimination
// ---------------------------------------------------------------------------

test("scope: reports unreferenced bindings", () => {
  const root = scope(parse("const used = 1; const unused = 2; used"))
  assert.deepEqual(
    names(root.bindings.filter((binding) => !binding.referenced)),
    ["unused"]
  )
})

test("scope: counts a write as a reference but not as a read", () => {
  const root = scope(parse("let a; a = 1"))
  const binding = root.getBinding("a")
  assert.equal(binding.referenced, true)
  assert.equal(binding.reads.length, 0)
  assert.equal(binding.writes.length, 1)
})

// ---------------------------------------------------------------------------
// reads / writes (reactivity)
// ---------------------------------------------------------------------------

test("scope: tracks reads and writes across assignment forms", () => {
  const root = scope(parse("let a = 0; a = 1; a += 2; a++; --a; a"))
  const binding = root.getBinding("a")
  assert.equal(binding.constant, false)
  assert.equal(binding.writes.length, 4)
  assert.equal(binding.reads.length, 4)
})

test("scope: marks a plain assignment as write only", () => {
  const reference = scope(parse("let a = 0; a = 1")).getBinding("a").references[0]
  assert.equal(reference.write, true)
  assert.equal(reference.read, false)
})

test("scope: marks a compound assignment as read and write", () => {
  const reference = scope(parse("let a = 0; a += 1")).getBinding("a").references[0]
  assert.equal(reference.write, true)
  assert.equal(reference.read, true)
})

test("scope: marks an update expression as read and write", () => {
  const reference = scope(parse("let a = 0; a++")).getBinding("a").references[0]
  assert.equal(reference.write, true)
  assert.equal(reference.read, true)
})

test("scope: marks a never reassigned binding as constant", () => {
  const root = scope(parse("let a = 1; a; a"))
  assert.equal(root.getBinding("a").constant, true)
})

test("scope: does not treat a member assignment as a write to the object", () => {
  const root = scope(parse("const obj = {}; obj.x = 1; obj.y += 2"))
  const binding = root.getBinding("obj")
  assert.equal(binding.writes.length, 0)
  assert.equal(binding.reads.length, 2)
  assert.equal(binding.constant, true)
})

// ---------------------------------------------------------------------------
// functions
// ---------------------------------------------------------------------------

test("scope: creates a function scope with params", () => {
  const root = scope(parse("function add (a, b) { return a + b }"))
  assert.equal(root.getBinding("add").kind, "function")
  const inner = root.children[0]
  assert.equal(inner.type, "function")
  assert.deepEqual(
    names(inner.bindings.filter((binding) => binding.kind === "param")),
    ["a", "b"]
  )
})

test("scope: does not create a nested block scope for a function body", () => {
  const root = scope(parse("function f () { let a = 1 }"))
  const inner = root.children[0]
  assert.equal(inner.getBinding("a").kind, "let")
  assert.equal(inner.children.length, 0)
})

test("scope: binds destructured parameters", () => {
  const root = scope(parse("function f ({ a, b = 1 }, [c], ...d) {}"))
  const inner = root.children[0]
  assert.deepEqual(
    names(inner.bindings.filter((binding) => binding.kind === "param")),
    ["a", "b", "c", "d"]
  )
})

test("scope: resolves a default parameter value against earlier params", () => {
  const root = scope(parse("function f (a, b = a) { return b }"))
  const inner = root.children[0]
  assert.equal(inner.getBinding("a").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: resolves a default parameter value against the outer scope", () => {
  const root = scope(parse("function f (a = missing) {}"))
  assert.deepEqual(names(root.globals), ["missing"])
})

test("scope: resolves a member expression in a default parameter", () => {
  const root = scope(parse("let a; function f (b = a.c) {}"))
  assert.equal(root.getBinding("a").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: resolves a nested function inside a default parameter", () => {
  const root = scope(parse("let a; function f (b = function () { return a }) {}"))
  const paramScope = root.children[0]
  const defaultScope = paramScope.children[0]
  assert.equal(defaultScope.type, "function")
  assert.equal(defaultScope.lookup("a"), root.getBinding("a"))
  assert.equal(root.getBinding("a").references.length, 1)
})

test("scope: binds a rest parameter", () => {
  const root = scope(parse("function f (...args) { return args }"))
  const inner = root.children[0]
  const binding = inner.getBinding("args")
  assert.equal(binding.kind, "param")
  assert.equal(binding.references.length, 1)
})

test("scope: supports arrow functions with an expression body", () => {
  const root = scope(parse("const f = (a) => a + b"))
  const inner = root.children[0]
  assert.equal(inner.type, "function")
  assert.equal(inner.getBinding("a").references.length, 1)
  assert.deepEqual(names(root.globals), ["b"])
})

test("scope: creates a scope for generators and async functions", () => {
  const root = scope(parse("async function* f () { await g(); yield h() }"))
  const inner = root.children[0]
  assert.equal(inner.type, "function")
  assert.deepEqual(names(root.globals), ["g", "h"])
})

// ---------------------------------------------------------------------------
// arguments
// ---------------------------------------------------------------------------

test("scope: adds an implicit arguments binding to functions", () => {
  const root = scope(parse("function f () { return arguments }"))
  const binding = root.children[0].getBinding("arguments")
  assert.equal(binding.kind, "implicit")
  assert.equal(binding.references.length, 1)
})

test("scope: does not add arguments to arrow functions", () => {
  const root = scope(parse("const f = () => arguments"))
  assert.equal(root.children[0].getBinding("arguments"), undefined)
  assert.deepEqual(names(root.globals), ["arguments"])
})

test("scope: resolves arguments inside an arrow to the enclosing function", () => {
  const root = scope(parse("function f () { return () => arguments }"))
  const fn = root.children[0]
  assert.equal(fn.getBinding("arguments").references.length, 1)
  assert.deepEqual(root.globals, [])
})

// ---------------------------------------------------------------------------
// var / let / const scoping
// ---------------------------------------------------------------------------

test("scope: hoists var declarations to the enclosing function scope", () => {
  const root = scope(parse("function f () { { var a = 1 } }"))
  const fn = root.children[0]
  assert.equal(fn.getBinding("a").kind, "var")
})

test("scope: does not hoist var across a function boundary", () => {
  const root = scope(parse("function f () { function g () { var x } x }"))
  const fn = root.children[0]
  const g = fn.children[0]
  assert.equal(g.getBinding("x").kind, "var")
  assert.equal(fn.getBinding("x"), undefined)
  assert.deepEqual(names(root.globals), ["x"])
})

test("scope: keeps let and const block scoped", () => {
  const root = scope(parse("{ let a = 1 }"))
  assert.equal(root.getBinding("a"), undefined)
  const block = root.children[0]
  assert.equal(block.type, "block")
  assert.equal(block.getBinding("a").kind, "let")
})

test("scope: exposes the enclosing variable scope", () => {
  const root = scope(parse("function f () { { let a = 1 } }"))
  const fn = root.children[0]
  const block = fn.children[0]
  assert.equal(block.variableScope, fn)
  assert.equal(root.variableScope, root)
})

// ---------------------------------------------------------------------------
// shadowing and lookup
// ---------------------------------------------------------------------------

test("scope: resolves shadowed references to the innermost binding", () => {
  const root = scope(parse("let a = 1; function f () { let a = 2; return a }"))
  assert.equal(root.getBinding("a").references.length, 0)
  assert.equal(root.children[0].getBinding("a").references.length, 1)
})

test("scope: shadows an outer binding with a parameter", () => {
  const root = scope(parse("let a = 1; function f (a) { return a }"))
  assert.equal(root.getBinding("a").references.length, 0)
  const param = root.children[0].getBinding("a")
  assert.equal(param.kind, "param")
  assert.equal(param.references.length, 1)
})

test("scope: lookup walks up the scope chain", () => {
  const root = scope(parse("const a = 1; function f () { return a }"))
  const inner = root.children[0]
  assert.equal(inner.lookup("a"), root.getBinding("a"))
  assert.equal(inner.getBinding("a"), undefined)
})

test("scope: lookup returns null for an unknown name", () => {
  const root = scope(parse("const a = 1"))
  assert.equal(root.lookup("missing"), null)
})

// ---------------------------------------------------------------------------
// blocks, loops, switch
// ---------------------------------------------------------------------------

test("scope: creates a scope for a for statement", () => {
  const root = scope(parse("for (let i = 0; i < 3; i++) { i }"))
  const loop = root.children[0]
  assert.equal(loop.type, "for")
  const binding = loop.getBinding("i")
  assert.equal(binding.references.length, 3)
  assert.equal(binding.constant, false)
})

test("scope: nests the for body block inside the for scope", () => {
  const root = scope(parse("for (let i = 0; i < 3; i++) { const j = i }"))
  const loop = root.children[0]
  const block = loop.children[0]
  assert.equal(block.type, "block")
  assert.equal(block.getBinding("j").references.length, 0)
  assert.equal(loop.getBinding("i").references.length, 3)
})

test("scope: binds the left side of for of", () => {
  const root = scope(parse("for (const item of items) { item }"))
  const loop = root.children[0]
  assert.equal(loop.getBinding("item").references.length, 1)
  assert.deepEqual(names(root.globals), ["items"])
})

test("scope: binds the left side of for in", () => {
  const root = scope(parse("for (const key in obj) { key }"))
  const loop = root.children[0]
  assert.equal(loop.getBinding("key").references.length, 1)
  assert.deepEqual(names(root.globals), ["obj"])
})

test("scope: hoists a var declared in a for head out of the loop", () => {
  const root = scope(parse("for (var i in obj) {} i"))
  assert.equal(root.getBinding("i").kind, "var")
  assert.equal(root.getBinding("i").references.length, 1)
})

test("scope: treats a bare for of target as an assignment", () => {
  const root = scope(parse("for (x of items) {}"))
  assert.deepEqual(names(root.globals).sort(), ["items", "x"])
  const reference = root.globals.find((global) => global.name === "x").references[0]
  assert.equal(reference.write, true)
})

test("scope: shares one block scope across switch cases", () => {
  const root = scope(parse("switch (v) { case 1: let a = 1; case 2: a }"))
  const block = root.children[0]
  assert.equal(block.type, "switch")
  assert.equal(block.getBinding("a").references.length, 1)
  assert.deepEqual(names(root.globals), ["v"])
})

// ---------------------------------------------------------------------------
// catch
// ---------------------------------------------------------------------------

test("scope: binds catch clause parameters", () => {
  const root = scope(parse("try { f() } catch (error) { error }"))
  const clause = child(root, "catch")
  const binding = clause.getBinding("error")
  assert.equal(binding.kind, "catch")
  assert.equal(binding.references.length, 1)
})

test("scope: binds a destructured catch parameter", () => {
  const root = scope(parse("try {} catch ({ message }) { message }"))
  const clause = child(root, "catch")
  assert.equal(clause.getBinding("message").references.length, 1)
})

test("scope: supports an optional catch binding", () => {
  const root = scope(parse("try { f() } catch { g() }"))
  const clause = child(root, "catch")
  assert.deepEqual(clause.bindings, [])
  assert.deepEqual(names(root.globals), ["f", "g"])
})

// ---------------------------------------------------------------------------
// destructuring
// ---------------------------------------------------------------------------

test("scope: binds deeply nested destructuring targets", () => {
  const root = scope(parse("const { a: { b, c: [d] } } = o"))
  assert.deepEqual(names(root.bindings), ["b", "d"])
  assert.deepEqual(names(root.globals), ["o"])
})

test("scope: treats computed keys and defaults in patterns as references", () => {
  const root = scope(parse("const { [k]: e = f } = o"))
  assert.deepEqual(names(root.bindings), ["e"])
  assert.deepEqual(names(root.globals).sort(), ["f", "k", "o"])
})

test("scope: binds array destructuring with holes and rest", () => {
  const root = scope(parse("const [, a, ...rest] = list"))
  assert.deepEqual(names(root.bindings), ["a", "rest"])
})

test("scope: binds an object rest element", () => {
  const root = scope(parse("const { a, ...rest } = o"))
  assert.deepEqual(names(root.bindings), ["a", "rest"])
  assert.deepEqual(names(root.globals), ["o"])
})

test("scope: writes to an object rest element in an assignment pattern", () => {
  const root = scope(parse("let a, rest; ({ a, ...rest } = o)"))
  assert.equal(root.getBinding("a").writes.length, 1)
  assert.equal(root.getBinding("rest").writes.length, 1)
  assert.deepEqual(names(root.globals), ["o"])
})

test("scope: reads a default value in an array assignment pattern", () => {
  const root = scope(parse("let a; [a = fallback] = arr"))
  assert.equal(root.getBinding("a").writes.length, 1)
  assert.deepEqual(names(root.globals).sort(), ["arr", "fallback"])
})

test("scope: writes to a rest element in an array assignment pattern", () => {
  const root = scope(parse("let a, rest; [a, ...rest] = arr"))
  assert.equal(root.getBinding("rest").writes.length, 1)
  assert.deepEqual(names(root.globals), ["arr"])
})

test("scope: reads member expression targets in a destructuring assignment", () => {
  const root = scope(parse("[obj.x, arr[i]] = source"))
  assert.deepEqual(names(root.globals).sort(), ["arr", "i", "obj", "source"])
  assert.deepEqual(root.bindings, [])
})

test("scope: treats an update of a member expression as a read of the object", () => {
  const root = scope(parse("const obj = { count: 0 }; obj.count++"))
  const binding = root.getBinding("obj")
  assert.equal(binding.reads.length, 1)
  assert.equal(binding.writes.length, 0)
})

test("scope: writes to identifiers in an array assignment pattern", () => {
  const root = scope(parse("let a, b; [a, b] = pair"))
  assert.equal(root.getBinding("a").writes.length, 1)
  assert.equal(root.getBinding("b").writes.length, 1)
  assert.deepEqual(names(root.globals), ["pair"])
})

test("scope: writes to identifiers in an object assignment pattern", () => {
  const root = scope(parse("let a, b; ({ a, b } = source)"))
  assert.equal(root.getBinding("a").writes.length, 1)
  assert.equal(root.getBinding("b").writes.length, 1)
  assert.deepEqual(names(root.globals), ["source"])
})

// ---------------------------------------------------------------------------
// member expressions, properties, keys
// ---------------------------------------------------------------------------

test("scope: does not treat member properties as references", () => {
  const root = scope(parse("foo.bar.baz"))
  assert.deepEqual(names(root.globals), ["foo"])
})

test("scope: treats computed member properties as references", () => {
  const root = scope(parse("foo[bar]"))
  assert.deepEqual(names(root.globals), ["foo", "bar"])
})

test("scope: treats optional computed member properties as references", () => {
  const root = scope(parse("a?.[b]?.c"))
  assert.deepEqual(names(root.globals), ["a", "b"])
})

test("scope: does not treat object literal keys as references", () => {
  const root = scope(parse("const o = { a: 1, [b]: 2 }"))
  assert.deepEqual(names(root.globals), ["b"])
})

test("scope: treats object shorthand as a read reference", () => {
  const root = scope(parse("const o = { x }"))
  assert.deepEqual(names(root.globals), ["x"])
})

test("scope: reads spread arguments", () => {
  const root = scope(parse("f(...args); [...more]; const o = { ...rest }"))
  assert.deepEqual(names(root.globals).sort(), ["args", "f", "more", "rest"])
})

test("scope: reads template literal expressions", () => {
  const root = scope(parse("tag`${a}${b}`"))
  assert.deepEqual(names(root.globals).sort(), ["a", "b", "tag"])
})

// ---------------------------------------------------------------------------
// this, super, meta
// ---------------------------------------------------------------------------

test("scope: does not treat this as a reference", () => {
  const root = scope(parse("this.x"))
  assert.deepEqual(root.globals, [])
})

test("scope: does not treat new.target as a reference", () => {
  const root = scope(parse("function f () { return new.target }"))
  assert.deepEqual(root.globals, [])
})

// ---------------------------------------------------------------------------
// labels
// ---------------------------------------------------------------------------

test("scope: does not treat labels as references", () => {
  const root = scope(parse("outer: for (;;) { break outer }"))
  assert.deepEqual(root.globals, [])
})

test("scope: does not treat continue labels as references", () => {
  const root = scope(parse("loop: for (;;) { continue loop }"))
  assert.deepEqual(root.globals, [])
})

// ---------------------------------------------------------------------------
// function expressions
// ---------------------------------------------------------------------------

test("scope: binds a named function expression inside its own scope", () => {
  const root = scope(parse("const f = function factorial () { return factorial }"))
  assert.equal(root.getBinding("factorial"), undefined)
  const inner = root.children[0]
  assert.equal(inner.getBinding("factorial").references.length, 1)
})

// ---------------------------------------------------------------------------
// classes
// ---------------------------------------------------------------------------

test("scope: creates a class scope with the class name visible inside", () => {
  const root = scope(parse("class A extends B { m () { return A } }"))
  assert.equal(root.getBinding("A").kind, "class")
  const classScope = child(root, "class")
  assert.equal(classScope.getBinding("A").references.length, 1)
  assert.deepEqual(names(root.globals), ["B"])
})

test("scope: evaluates the superclass in the outer scope", () => {
  const root = scope(parse("const Base = class {}; class A extends Base {}"))
  assert.equal(root.getBinding("Base").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: does not treat method names as references", () => {
  const root = scope(parse("class A { method () {} static other () {} }"))
  assert.deepEqual(root.globals, [])
})

test("scope: treats computed method names as references", () => {
  const root = scope(parse("class A { [name] () {} }"))
  assert.deepEqual(names(root.globals), ["name"])
})

test("scope: analyzes class field initializers and computed keys", () => {
  const root = scope(parse("class A { [key] = value; static s = init }"))
  assert.deepEqual(names(root.globals).sort(), ["init", "key", "value"])
})

test("scope: creates a scope for a class expression", () => {
  const root = scope(parse("const A = class Named { m () { return Named } }"))
  assert.equal(root.getBinding("Named"), undefined)
  const classScope = child(root, "class")
  assert.equal(classScope.getBinding("Named").references.length, 1)
})

// ---------------------------------------------------------------------------
// object getters and setters
// ---------------------------------------------------------------------------

test("scope: creates function scopes for object getters and setters", () => {
  const root = scope(parse("const o = { get x () { return v }, set x (val) { w = val } }"))
  const getters = root.children.filter((item) => item.type === "function")
  assert.equal(getters.length, 2)
  assert.deepEqual(names(root.globals).sort(), ["v", "w"])
})

// ---------------------------------------------------------------------------
// imports and exports
// ---------------------------------------------------------------------------

test("scope: binds default, named and namespace imports", () => {
  const root = scope(parse('import foo, { bar as baz } from "x"; import * as ns from "y"'))
  assert.deepEqual(names(root.bindings), ["foo", "baz", "ns"])
  assert.ok(root.bindings.every((binding) => binding.kind === "import"))
})

test("scope: resolves references to imports", () => {
  const root = scope(parse('import foo from "x"; foo()'))
  assert.equal(root.getBinding("foo").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: ignores side effect only imports", () => {
  const root = scope(parse('import "x"'))
  assert.deepEqual(root.bindings, [])
})

test("scope: references locals exported by specifier", () => {
  const root = scope(parse("const answer = 42; export { answer }"))
  assert.equal(root.getBinding("answer").references.length, 1)
})

test("scope: references renamed local exports", () => {
  const root = scope(parse("const answer = 42; export { answer as result }"))
  assert.equal(root.getBinding("answer").references.length, 1)
})

test("scope: does not create references for re-exports from a source", () => {
  const root = scope(parse('export { a as b } from "x"'))
  assert.deepEqual(root.globals, [])
  assert.deepEqual(root.bindings, [])
})

test("scope: ignores export all declarations", () => {
  const root = scope(parse('export * from "x"'))
  assert.deepEqual(root.globals, [])
})

test("scope: binds an exported declaration", () => {
  const root = scope(parse("export const answer = 42; export function f () {}"))
  assert.deepEqual(names(root.bindings), ["answer", "f"])
})

test("scope: binds a named default export", () => {
  const root = scope(parse("export default function foo () { return foo }"))
  assert.equal(root.getBinding("foo").references.length, 1)
})

test("scope: supports an anonymous default export", () => {
  const root = scope(parse("export default function () {}"))
  assert.deepEqual(root.bindings, [])
  assert.equal(root.children[0].type, "function")
})

test("scope: analyzes a default exported expression", () => {
  const root = scope(parse("export default a + b"))
  assert.deepEqual(names(root.globals), ["a", "b"])
})

test("scope: treats an undeclared exported name as a reference", () => {
  const root = scope(parse("export { missing }"))
  assert.deepEqual(names(root.globals), ["missing"])
})

// ---------------------------------------------------------------------------
// edge cases inspired by eslint-scope
// ---------------------------------------------------------------------------

test("scope: treats the operand of typeof as a reference", () => {
  const root = scope(parse("typeof x"))
  assert.deepEqual(names(root.globals), ["x"])
})

test("scope: aggregates references to a global across scopes", () => {
  const root = scope(parse("foo; function f () { return foo }"))
  assert.equal(root.globals.length, 1)
  assert.equal(root.globals[0].references.length, 2)
})

test("scope: records a top level assignment to a global as a write", () => {
  const root = scope(parse("x = 1"))
  const reference = root.globals[0].references[0]
  assert.equal(reference.write, true)
  assert.equal(reference.read, false)
})

test("scope: records an increment of a global as a read and write", () => {
  const root = scope(parse("count++"))
  const reference = root.globals[0].references[0]
  assert.equal(reference.read, true)
  assert.equal(reference.write, true)
})

test("scope: records a write to an imported binding", () => {
  const root = scope(parse('import foo from "x"; foo = 1'))
  const binding = root.getBinding("foo")
  assert.equal(binding.writes.length, 1)
  assert.equal(binding.constant, false)
})

test("scope: resolves a recursive const arrow reference to itself", () => {
  const root = scope(parse("const f = () => f"))
  assert.equal(root.getBinding("f").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: resolves a function name referenced in its own default parameter", () => {
  const root = scope(parse("function foo (a = foo) {}"))
  assert.equal(root.getBinding("foo").references.length, 1)
  assert.deepEqual(root.globals, [])
})

test("scope: creates a block scope for a labeled block statement", () => {
  const root = scope(parse("label: { let a = 1; a }"))
  assert.deepEqual(root.bindings, [])
  const block = root.children[0]
  assert.equal(block.type, "block")
  assert.equal(block.getBinding("a").references.length, 1)
})

test("scope: resolves a reference across several nested function scopes", () => {
  const root = scope(
    parse("function a (x) { return function b () { return function c () { return x } } }")
  )
  const outer = root.children[0]
  const deepest = outer.children[0].children[0]
  assert.equal(deepest.lookup("x"), outer.getBinding("x"))
})

test("scope: creates a block scope for a class static block", () => {
  const root = scope(parse("class A { static { let x = 1; x } }"))
  const classScope = child(root, "class")
  const block = child(classScope, "block")
  assert.equal(block.getBinding("x").references.length, 1)
})

test("scope: uses a single binding for a let declared in a loop head", () => {
  // per-iteration bindings are intentionally not modelled; every occurrence of
  // the loop variable resolves to one binding, which suits renaming and analysis
  const root = scope(parse("for (let i = 0; i < 3; i++) { arr.push(() => i) }"))
  const loop = root.children[0]
  assert.equal(loop.bindings.filter((binding) => binding.name === "i").length, 1)
  assert.equal(loop.getBinding("i").references.length, 3)
})
