const test = require("node:test")
const assert = require("node:assert")
const { execFileSync } = require("node:child_process")
const AbstractSyntaxTree = require("..")
const { parse, generate, bundle } = AbstractSyntaxTree

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()
const run = (modules, options) => output(bundle(modules.entry, { modules, ...options }))

// Reparsing does not reject duplicate declarations, so anything that renames is
// checked against a real engine as well.
const evaluate = (modules, options) => {
  const source = generate(bundle(modules.entry, { modules, ...options }))
  return execFileSync(process.execPath, ["--input-type=module", "--eval", source], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim()
}

// ---------------------------------------------------------------------------
// basics
// ---------------------------------------------------------------------------

test("bundle: returns a module program", () => {
  const tree = bundle("const x = 1; x", { modules: {} })
  assert.equal(tree.type, "Program")
  assert.equal(tree.sourceType, "module")
})

test("bundle: is available as a static method", () => {
  assert.equal(typeof AbstractSyntaxTree.bundle, "function")
})

test("bundle: is available as an instance method", () => {
  const tree = new AbstractSyntaxTree('import { a } from "./a.js"; console.log(a)')
  tree.bundle({ modules: { "./a.js": "export const a = 1" } })
  assert.equal(output(tree._tree), "const a = 1; console.log(a);")
})

test("bundle: leaves a module without imports alone", () => {
  assert.equal(run({ entry: "const x = 1; console.log(x)" }), "const x = 1; console.log(x);")
})

test("bundle: accepts the entry as a tree", () => {
  const tree = bundle(parse('import { a } from "./a.js"; a'), {
    modules: { "./a.js": "export const a = 1" }
  })
  assert.equal(output(tree), "const a = 1; a;")
})

test("bundle: inlines a named import", () => {
  assert.equal(
    run({ entry: 'import { PI } from "./m.js"; console.log(PI)', "./m.js": "export const PI = 3.14" }),
    "const PI = 3.14; console.log(PI);"
  )
})

test("bundle: inlines a default import", () => {
  assert.equal(
    run({ entry: 'import f from "./m.js"; f()', "./m.js": "export default function f () {}" }),
    "function f() {} f();"
  )
})

test("bundle: inlines a default and a named import together", () => {
  assert.equal(
    run({
      entry: 'import multiply, { PI } from "./m.js"; console.log(multiply(PI, 2))',
      "./m.js": "export const PI = 3.14; export default function multiply (a, b) { return a * b }"
    }),
    "const PI = 3.14; function multiply(a, b) { return a * b; } console.log(multiply(PI, 2));"
  )
})

test("bundle: renames an aliased import to its target", () => {
  assert.equal(
    run({ entry: 'import { a as b } from "./a.js"; console.log(b)', "./a.js": "export const a = 1" }),
    "const a = 1; console.log(a);"
  )
})

test("bundle: keeps a side effect only import", () => {
  assert.equal(
    run({ entry: 'import "./a.js"; console.log(1)', "./a.js": "console.log(0)" }),
    "console.log(0); console.log(1);"
  )
})

// ---------------------------------------------------------------------------
// ordering
// ---------------------------------------------------------------------------

test("bundle: places a dependency before its importer", () => {
  assert.equal(
    run({ entry: 'import "./a.js"; console.log(2)', "./a.js": "console.log(1)" }),
    "console.log(1); console.log(2);"
  )
})

test("bundle: includes a shared dependency once", () => {
  assert.equal(
    run({
      entry: 'import "./a.js"; import "./b.js"',
      "./a.js": 'import "./c.js"',
      "./b.js": 'import "./c.js"',
      "./c.js": "console.log(1)"
    }),
    "console.log(1);"
  )
})

// ---------------------------------------------------------------------------
// deconflicting
// ---------------------------------------------------------------------------

test("bundle: renames a binding that collides with a dependency", () => {
  assert.equal(
    run({
      entry: 'import { PI as P } from "./m.js"; const PI = 3; console.log(P, PI)',
      "./m.js": "export const PI = 3.14"
    }),
    "const PI = 3.14; const PI$1 = 3; console.log(PI, PI$1);"
  )
})

test("bundle: keeps the meaning of a collision", () => {
  assert.equal(
    evaluate({
      entry: 'import { PI as P } from "./m.js"; const PI = 3; console.log(P, PI)',
      "./m.js": "export const PI = 3.14"
    }),
    "3.14 3"
  )
})

test("bundle: does not let a binding capture another module's global", () => {
  assert.equal(
    evaluate({
      entry: 'import { f } from "./a.js"; f()',
      "./a.js": 'const fetch = () => "local"; export function f () { console.log(fetch()) }'
    }),
    "local"
  )
})

test("bundle: skips a name that is a global somewhere else", () => {
  const result = run({
    entry: 'import { f } from "./a.js"; f(); format()',
    "./a.js": "const format = () => 1; export function f () { return format() }"
  })
  assert.ok(result.includes("format$1"), result)
})

test("bundle: renames a class together with its self reference", () => {
  assert.equal(
    evaluate({
      entry: 'import A from "./a.js"; import B from "./b.js"; console.log(new A().id, new B().id)',
      "./a.js": 'export default class Item { get id () { return "a:" + Item.name } }',
      "./b.js": 'export default class Item { get id () { return "b:" + Item.name } }'
    }),
    "a:Item b:Item$1"
  )
})

test("bundle: expands a shorthand property when the local is renamed", () => {
  assert.equal(
    run({
      entry: 'import { x as y } from "./a.js"; const x = 2; console.log({ x, y })',
      "./a.js": "export const x = 1"
    }),
    "const x = 1; const x$1 = 2; console.log({ x: x$1, y: x });"
  )
})

test("bundle: leaves nested scopes alone", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./a.js"; function f () { const a = 2; return a } console.log(a, f())',
      "./a.js": "export const a = 1"
    }),
    "const a = 1; function f() { const a = 2; return a; } console.log(a, f());"
  )
})

// ---------------------------------------------------------------------------
// default exports
// ---------------------------------------------------------------------------

test("bundle: names an anonymous default function", () => {
  assert.equal(
    run({ entry: 'import f from "./a.js"; f()', "./a.js": "export default function () {}" }),
    "function a_default() {} a_default();"
  )
})

test("bundle: names an anonymous default class", () => {
  assert.equal(
    run({ entry: 'import C from "./a.js"; new C()', "./a.js": "export default class {}" }),
    "class a_default {} new a_default();"
  )
})

test("bundle: binds a default expression to a constant", () => {
  assert.equal(
    run({ entry: 'import v from "./a.js"; console.log(v)', "./a.js": "export default 1 + 2" }),
    "const a_default = 1 + 2; console.log(a_default);"
  )
})

test("bundle: keeps the name of a named default export", () => {
  assert.equal(
    run({ entry: 'import f from "./a.js"; f()', "./a.js": "export default function named () {}" }),
    "function named() {} named();"
  )
})

test("bundle: sanitizes a module id used for a default name", () => {
  assert.equal(
    run({ entry: 'import v from "./lib/3d.js"; v', "./lib/3d.js": "export default 42" }),
    "const _3d_default = 42; _3d_default;"
  )
})

// ---------------------------------------------------------------------------
// namespaces
// ---------------------------------------------------------------------------

test("bundle: dissolves a namespace used only for static reads", () => {
  assert.equal(
    run({
      entry: 'import * as m from "./m.js"; console.log(m.PI, m.E)',
      "./m.js": "export const PI = 3.14; export const E = 2.71"
    }),
    "const PI = 3.14; const E = 2.71; console.log(PI, E);"
  )
})

test("bundle: builds a namespace object when it is used as a value", () => {
  const result = run({
    entry: 'import * as m from "./m.js"; console.log(m)',
    "./m.js": "export const a = 1"
  })
  assert.ok(result.includes("Object.freeze"), result)
  assert.ok(result.includes("get a()"), result)
})

test("bundle: builds a namespace object for a computed access", () => {
  const result = run({
    entry: 'import * as m from "./m.js"; console.log(m[key])',
    "./m.js": "export const a = 1"
  })
  assert.ok(result.includes("Object.freeze"), result)
})

test("bundle: builds a namespace object when asked to", () => {
  const result = run(
    { entry: 'import * as m from "./m.js"; console.log(m.a)', "./m.js": "export const a = 1" },
    { namespace: "object" }
  )
  assert.ok(result.includes("Object.freeze"), result)
})

test("bundle: keeps a namespace object live and frozen", () => {
  assert.equal(
    evaluate({
      entry: 'import * as m from "./m.js"; m.inc(); console.log(m.count, Object.isFrozen(m), Object.getPrototypeOf(m))',
      "./m.js": "export let count = 0; export function inc () { count++ }"
    }),
    "1 true null"
  )
})

test("bundle: includes a default export in a namespace", () => {
  assert.equal(
    run({
      entry: 'import * as m from "./a.js"; console.log(m.default, m.x)',
      "./a.js": "export default 1; export const x = 2"
    }),
    "const a_default = 1; const x = 2; console.log(a_default, x);"
  )
})

test("bundle: throws for a namespace read that is not exported", () => {
  assert.throws(
    () => run({ entry: 'import * as m from "./m.js"; m.nope', "./m.js": "export const a = 1" }),
    /"nope" is not exported by "\.\/m\.js"/
  )
})

// ---------------------------------------------------------------------------
// re-exports
// ---------------------------------------------------------------------------

test("bundle: follows a named re-export", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./r.js"; console.log(a)',
      "./r.js": 'export { a } from "./a.js"',
      "./a.js": "export const a = 1"
    }),
    "const a = 1; console.log(a);"
  )
})

test("bundle: follows an aliased re-export", () => {
  assert.equal(
    run({
      entry: 'import { b } from "./r.js"; console.log(b)',
      "./r.js": 'export { a as b } from "./a.js"',
      "./a.js": "export const a = 1"
    }),
    "const a = 1; console.log(a);"
  )
})

test("bundle: follows a star re-export", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./r.js"; console.log(a)',
      "./r.js": 'export * from "./a.js"',
      "./a.js": "export const a = 1"
    }),
    "const a = 1; console.log(a);"
  )
})

test("bundle: follows a chain of re-exports", () => {
  assert.equal(
    evaluate({
      entry: 'import { z } from "./a.js"; console.log(z)',
      "./a.js": 'export { z } from "./b.js"',
      "./b.js": 'export { y as z } from "./c.js"',
      "./c.js": 'export const y = "deep"'
    }),
    "deep"
  )
})

test("bundle: follows an import that is re-exported", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./r.js"; console.log(a)',
      "./r.js": 'import { a } from "./a.js"; export { a }',
      "./a.js": "export const a = 1"
    }),
    "const a = 1; console.log(a);"
  )
})

test("bundle: builds an object for a namespace re-export", () => {
  const result = run({
    entry: 'import { m } from "./r.js"; console.log(m.a)',
    "./r.js": 'export * as m from "./a.js"',
    "./a.js": "export const a = 1"
  })
  assert.ok(result.includes("Object.freeze"), result)
})

test("bundle: does not carry a default through a star", () => {
  assert.throws(
    () =>
      run({
        entry: 'import d from "./r.js"; d',
        "./r.js": 'export * from "./a.js"',
        "./a.js": "export default 1"
      }),
    /"default" is not exported by "\.\/r\.js"/
  )
})

test("bundle: throws for a name two stars both provide", () => {
  assert.throws(
    () =>
      run({
        entry: 'import { x } from "./r.js"; x',
        "./r.js": 'export * from "./a.js"; export * from "./b.js"',
        "./a.js": "export const x = 1",
        "./b.js": "export const x = 2"
      }),
    /exported by more than one module/
  )
})

// ---------------------------------------------------------------------------
// entry exports
// ---------------------------------------------------------------------------

test("bundle: keeps the entry's own exports", () => {
  assert.equal(run({ entry: "export const answer = 42" }), "const answer = 42; export {answer};")
})

test("bundle: keeps an entry export under its public name after a rename", () => {
  assert.equal(
    run({ entry: 'import { PI } from "./m.js"; export const PI2 = PI', "./m.js": "export const PI = 3.14" }),
    "const PI = 3.14; const PI2 = PI; export {PI2};"
  )
})

test("bundle: keeps an entry default export", () => {
  assert.equal(run({ entry: "export default function main () {}" }), "function main() {} export {main as default};")
})

test("bundle: keeps an entry default expression export", () => {
  assert.equal(
    run({ entry: "export default 1 + 2" }),
    "const entry_default = 1 + 2; export {entry_default as default};"
  )
})

test("bundle: keeps entry exports forwarded by a star", () => {
  assert.equal(
    run({ entry: 'export * from "./a.js"', "./a.js": "export const a = 1; export const b = 2" }),
    "const a = 1; const b = 2; export {a, b};"
  )
})

test("bundle: keeps an entry export from being pruned", () => {
  assert.equal(
    run({ entry: 'import { a } from "./a.js"; export { a }', "./a.js": "export const a = 1" }),
    "const a = 1; export {a};"
  )
})

// ---------------------------------------------------------------------------
// externals
// ---------------------------------------------------------------------------

test("bundle: keeps a bare specifier as an import", () => {
  assert.equal(
    run({ entry: 'import React from "react"; console.log(React)' }),
    'import React from "react"; console.log(React);'
  )
})

test("bundle: keeps named external specifiers", () => {
  assert.equal(
    run({ entry: 'import { useState, useRef } from "react"; useState(useRef())' }),
    'import {useState, useRef} from "react"; useState(useRef());'
  )
})

test("bundle: shares one local for the same external binding", () => {
  const result = run({
    entry: 'import R from "react"; import { f } from "./a.js"; R; f()',
    "./a.js": 'import R from "react"; export function f () { return R }'
  })
  assert.equal(result.match(/import/g).length, 1)
  assert.ok(!result.includes("R$1"), result)
})

test("bundle: accepts external as an array", () => {
  const result = run({ entry: 'import { a } from "./a.js"; a', "./a.js": "export const a = 1" }, {
    external: ["./a.js"]
  })
  assert.equal(result, 'import {a} from "./a.js"; a;')
})

test("bundle: accepts external as a predicate", () => {
  const result = run({ entry: 'import { a } from "./a.js"; a', "./a.js": "export const a = 1" }, {
    external: (specifier) => specifier === "./a.js"
  })
  assert.equal(result, 'import {a} from "./a.js"; a;')
})

test("bundle: treats a null from resolve as external", () => {
  assert.equal(
    run({ entry: 'import { a } from "./a.js"; a', "./a.js": "export const a = 1" }, { resolve: () => null }),
    'import {a} from "./a.js"; a;'
  )
})

// ---------------------------------------------------------------------------
// errors
// ---------------------------------------------------------------------------

test("bundle: throws for a module that cannot be resolved", () => {
  assert.throws(() => run({ entry: 'import "./nope.js"' }), /Cannot resolve "\.\/nope\.js" from "entry"/)
})

test("bundle: throws for a name a module does not export", () => {
  assert.throws(
    () => run({ entry: 'import { nope } from "./a.js"; nope', "./a.js": "export const a = 1" }),
    /"nope" is not exported by "\.\/a\.js"/
  )
})

test("bundle: throws for a missing default export", () => {
  assert.throws(
    () => run({ entry: 'import d from "./a.js"; d', "./a.js": "export const a = 1" }),
    /"default" is not exported by "\.\/a\.js"/
  )
})

// ---------------------------------------------------------------------------
// cycles
// ---------------------------------------------------------------------------

test("bundle: terminates on a cycle", () => {
  assert.equal(
    run({
      entry: 'import "./a.js"; console.log(1)',
      "./a.js": 'import "./b.js"; console.log(2)',
      "./b.js": 'import "./a.js"; console.log(3)'
    }),
    "console.log(3); console.log(2); console.log(1);"
  )
})

test("bundle: keeps mutually recursive functions working across a cycle", () => {
  assert.equal(
    evaluate({
      entry: 'import { even } from "./a.js"; console.log(even(4))',
      "./a.js": 'import { odd } from "./b.js"; export function even (n) { return n === 0 ? true : odd(n - 1) }',
      "./b.js": 'import { even } from "./a.js"; export function odd (n) { return n === 0 ? false : even(n - 1) }'
    }),
    "true"
  )
})

test("bundle: throws on a cycle when asked to", () => {
  assert.throws(
    () => run({ entry: 'import "./a.js"', "./a.js": 'import "./a.js"' }, { cycles: "throw" }),
    /Circular dependency/
  )
})

test("bundle: allows cycles by default", () => {
  assert.doesNotThrow(() => run({ entry: 'import "./a.js"', "./a.js": 'import "./a.js"' }))
})

// ---------------------------------------------------------------------------
// tree shaking
// ---------------------------------------------------------------------------

test("bundle: removes an export nothing imports", () => {
  assert.equal(
    run({
      entry: 'import { used } from "./m.js"; console.log(used)',
      "./m.js": "export const used = 1; export const unused = 2"
    }),
    "const used = 1; console.log(used);"
  )
})

test("bundle: cascades through a removed export", () => {
  assert.equal(
    run({
      entry: 'import { used } from "./m.js"; console.log(used)',
      "./m.js": "const helper = 2; export const unused = helper; export const used = 1"
    }),
    "const used = 1; console.log(used);"
  )
})

test("bundle: keeps a dependency with side effects", () => {
  assert.equal(
    run({
      entry: 'import { used } from "./m.js"; console.log(used)',
      "./m.js": 'console.log("side effect"); export const used = 1'
    }),
    'console.log("side effect"); const used = 1; console.log(used);'
  )
})

test("bundle: keeps everything when tree shaking is off", () => {
  assert.equal(
    run(
      {
        entry: 'import { used } from "./m.js"; console.log(used)',
        "./m.js": "export const used = 1; export const unused = 2"
      },
      { treeshake: false }
    ),
    "const used = 1; const unused = 2; console.log(used);"
  )
})

// ---------------------------------------------------------------------------
// live bindings
// ---------------------------------------------------------------------------

test("bundle: keeps an exported binding live", () => {
  assert.equal(
    evaluate({
      entry: 'import { count, inc } from "./c.js"; inc(); inc(); console.log(count)',
      "./c.js": "export let count = 0; export function inc () { count++ }"
    }),
    "2"
  )
})

// ---------------------------------------------------------------------------
// passed through untouched
// ---------------------------------------------------------------------------

test("bundle: leaves import.meta alone", () => {
  assert.equal(run({ entry: "console.log(import.meta.url)" }), "console.log(import.meta.url);")
})

test("bundle: leaves a dynamic import alone", () => {
  assert.equal(run({ entry: 'import("./a.js").then(f)' }), 'import("./a.js").then(f);')
})

test("bundle: moves a nested binding that would capture an import", () => {
  assert.equal(
    run({
      entry: 'import { x as y } from "./a.js"; function f () { const x = 1; return [x, y] } f()',
      "./a.js": "export const x = 99"
    }),
    "const x = 99; function f() { const x$1 = 1; return [x$1, x]; } f();"
  )
})

test("bundle: keeps the meaning of a moved nested binding", () => {
  assert.equal(
    evaluate({
      entry: 'import { x as y } from "./a.js"; function f () { const x = 1; return [x, y] } console.log(f().join(","))',
      "./a.js": "export const x = 99"
    }),
    "1,99"
  )
})
