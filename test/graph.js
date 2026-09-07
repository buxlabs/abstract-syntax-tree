const test = require("node:test")
const assert = require("node:assert")
const AbstractSyntaxTree = require("..")
const { parse, graph } = AbstractSyntaxTree

const run = (entry, modules, options) => graph(entry, { modules, ...options })

// ---------------------------------------------------------------------------
// basics
// ---------------------------------------------------------------------------

test("graph: returns the entry when it has no dependencies", () => {
  const result = run("const x = 1", {})
  assert.deepEqual(result.order, ["entry"])
  assert.deepEqual(result.cycles, [])
  assert.deepEqual(result.externals, [])
})

test("graph: is available as a static method", () => {
  assert.equal(typeof AbstractSyntaxTree.graph, "function")
})

test("graph: is available as an instance method", () => {
  const tree = new AbstractSyntaxTree('import "./a.js"')
  const result = tree.graph({ modules: { "./a.js": "const x = 1" } })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

test("graph: uses the given entry id", () => {
  const result = run("const x = 1", {}, { entry: "src/main.js" })
  assert.equal(result.entry, "src/main.js")
  assert.deepEqual(result.order, ["src/main.js"])
})

test("graph: exposes parsed modules by id", () => {
  const result = run('import "./a.js"', { "./a.js": "const x = 1" })
  assert.equal(result.modules.get("./a.js").tree.type, "Program")
  assert.equal(result.modules.get("./a.js").id, "./a.js")
})

// ---------------------------------------------------------------------------
// module sources
// ---------------------------------------------------------------------------

test("graph: accepts module sources as strings", () => {
  assert.deepEqual(run('import "./a.js"', { "./a.js": "const x = 1" }).order, ["./a.js", "entry"])
})

test("graph: accepts module sources as trees", () => {
  assert.deepEqual(run('import "./a.js"', { "./a.js": parse("const x = 1") }).order, ["./a.js", "entry"])
})

test("graph: accepts a map of modules", () => {
  const modules = new Map([["./a.js", "const x = 1"]])
  assert.deepEqual(run('import "./a.js"', modules).order, ["./a.js", "entry"])
})

test("graph: accepts a function of modules", () => {
  const modules = (id) => (id === "./a.js" ? "const x = 1" : undefined)
  assert.deepEqual(run('import "./a.js"', modules).order, ["./a.js", "entry"])
})

test("graph: accepts the entry as a tree", () => {
  const result = run(parse('import "./a.js"'), { "./a.js": "const x = 1" })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

// ---------------------------------------------------------------------------
// ordering
// ---------------------------------------------------------------------------

test("graph: places a dependency before its importer", () => {
  const result = run('import { PI } from "./math.js"; PI', { "./math.js": "export const PI = 3.14" })
  assert.deepEqual(result.order, ["./math.js", "entry"])
})

test("graph: includes a shared dependency once", () => {
  const result = run('import "./a.js"; import "./b.js"', {
    "./a.js": 'import "./c.js"',
    "./b.js": 'import "./c.js"',
    "./c.js": "const x = 1"
  })
  assert.deepEqual(result.order, ["./c.js", "./a.js", "./b.js", "entry"])
})

test("graph: orders depth first in source order", () => {
  const result = run('import "./a.js"; import "./b.js"', {
    "./a.js": "const a = 1",
    "./b.js": "const b = 2"
  })
  assert.deepEqual(result.order, ["./a.js", "./b.js", "entry"])
})

test("graph: follows a chain", () => {
  const result = run('import "./a.js"', {
    "./a.js": 'import "./b.js"',
    "./b.js": 'import "./c.js"',
    "./c.js": "const x = 1"
  })
  assert.deepEqual(result.order, ["./c.js", "./b.js", "./a.js", "entry"])
})

// ---------------------------------------------------------------------------
// cycles
// ---------------------------------------------------------------------------

test("graph: reports a cycle instead of hanging", () => {
  const result = run('import "./a.js"', {
    "./a.js": 'import "./b.js"',
    "./b.js": 'import "./a.js"'
  })
  assert.deepEqual(result.order, ["./b.js", "./a.js", "entry"])
  assert.deepEqual(result.cycles, [["./a.js", "./b.js", "./a.js"]])
})

test("graph: reports a self cycle", () => {
  const result = run('import "./a.js"', { "./a.js": 'import "./a.js"' })
  assert.deepEqual(result.cycles, [["./a.js", "./a.js"]])
})

test("graph: reports a cycle through the entry", () => {
  const result = run('import "./a.js"', { "./a.js": 'import "entry"' })
  assert.deepEqual(result.cycles, [["entry", "./a.js", "entry"]])
})

test("graph: reports no cycles for an acyclic graph", () => {
  const result = run('import "./a.js"', { "./a.js": "const x = 1" })
  assert.deepEqual(result.cycles, [])
})

// ---------------------------------------------------------------------------
// externals
// ---------------------------------------------------------------------------

test("graph: treats a bare specifier as external", () => {
  const result = run('import React from "react"', {})
  assert.deepEqual(result.externals, ["react"])
  assert.deepEqual(result.order, ["entry"])
})

test("graph: treats a url specifier as external", () => {
  assert.deepEqual(run('import "https://example.com/a.js"', {}).externals, ["https://example.com/a.js"])
})

test("graph: lists each external specifier once", () => {
  const result = run('import a from "react"; import { b } from "react"', {})
  assert.deepEqual(result.externals, ["react"])
})

test("graph: accepts external as an array", () => {
  const result = run('import "./a.js"', { "./a.js": "const x = 1" }, { external: ["./a.js"] })
  assert.deepEqual(result.externals, ["./a.js"])
  assert.deepEqual(result.order, ["entry"])
})

test("graph: accepts external as a regular expression", () => {
  const result = run('import "./a.js"; import "./b.js"', {
    "./a.js": "const a = 1",
    "./b.js": "const b = 2"
  }, { external: /a\.js$/ })
  assert.deepEqual(result.externals, ["./a.js"])
  assert.deepEqual(result.order, ["./b.js", "entry"])
})

test("graph: accepts external as a predicate", () => {
  const seen = []
  const result = run('import "./a.js"', { "./a.js": "const x = 1" }, {
    external: (specifier, importer) => {
      seen.push([specifier, importer])
      return true
    }
  })
  assert.deepEqual(seen, [["./a.js", "entry"]])
  assert.deepEqual(result.externals, ["./a.js"])
})

// ---------------------------------------------------------------------------
// resolution
// ---------------------------------------------------------------------------

test("graph: calls resolve with the specifier and the importer", () => {
  const seen = []
  run('import "./a.js"', { a: 'import "./b.js"', b: "const x = 1" }, {
    resolve: (specifier, importer) => {
      seen.push([specifier, importer])
      return specifier.slice(2, 3)
    }
  })
  assert.deepEqual(seen, [["./a.js", "entry"], ["./b.js", "a"]])
})

test("graph: treats a null from resolve as external", () => {
  const result = run('import "./a.js"', { "./a.js": "const x = 1" }, { resolve: () => null })
  assert.deepEqual(result.externals, ["./a.js"])
  assert.deepEqual(result.order, ["entry"])
})

test("graph: resolves relative to the importer", () => {
  const result = run('import "./math.js"', { "src/math.js": "const x = 1" }, { entry: "src/entry.js" })
  assert.deepEqual(result.order, ["src/math.js", "src/entry.js"])
})

test("graph: resolves a parent directory specifier", () => {
  const result = run('import "../math.js"', { "src/math.js": "const x = 1" }, { entry: "src/lib/entry.js" })
  assert.deepEqual(result.order, ["src/math.js", "src/lib/entry.js"])
})

test("graph: resolves an extensionless specifier", () => {
  assert.deepEqual(run('import "./a"', { "./a.js": "const x = 1" }).order, ["./a.js", "entry"])
})

test("graph: resolves an mjs extension", () => {
  assert.deepEqual(run('import "./a"', { "./a.mjs": "const x = 1" }).order, ["./a.mjs", "entry"])
})

test("graph: resolves a directory index", () => {
  assert.deepEqual(run('import "./a"', { "./a/index.js": "const x = 1" }).order, ["./a/index.js", "entry"])
})

test("graph: prefers an exact key over path resolution", () => {
  const result = run('import "./a"', { "./a": "const exact = 1", "./a.js": "const x = 1" })
  assert.deepEqual(result.order, ["./a", "entry"])
})

// ---------------------------------------------------------------------------
// missing modules
// ---------------------------------------------------------------------------

test("graph: throws for an unresolvable relative specifier", () => {
  assert.throws(() => run('import "./nope.js"', {}), /Cannot resolve "\.\/nope\.js" from "entry"/)
})

test("graph: collects missing modules when asked", () => {
  const result = run('import "./nope.js"', {}, { missing: "collect" })
  assert.deepEqual(result.missing, [{ specifier: "./nope.js", importer: "entry" }])
  assert.deepEqual(result.order, ["entry"])
})

test("graph: reports no missing modules by default", () => {
  assert.deepEqual(run('import "./a.js"', { "./a.js": "const x = 1" }).missing, [])
})

// ---------------------------------------------------------------------------
// module syntax that creates edges
// ---------------------------------------------------------------------------

test("graph: follows a named re-export", () => {
  const result = run('export { a } from "./a.js"', { "./a.js": "export const a = 1" })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

test("graph: follows a star re-export", () => {
  const result = run('export * from "./a.js"', { "./a.js": "export const a = 1" })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

test("graph: follows a namespace re-export", () => {
  const result = run('export * as ns from "./a.js"', { "./a.js": "export const a = 1" })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

test("graph: follows a side effect only import", () => {
  assert.deepEqual(run('import "./a.js"', { "./a.js": "console.log(1)" }).order, ["./a.js", "entry"])
})

test("graph: ignores an export without a source", () => {
  const result = run("export const a = 1", {})
  assert.deepEqual(result.order, ["entry"])
  assert.deepEqual(result.externals, [])
})

test("graph: records imports and exports per module", () => {
  const result = run('import "./a.js"; export const b = 1', { "./a.js": "const x = 1" })
  const module = result.modules.get("entry")
  assert.equal(module.imports.length, 1)
  assert.equal(module.exports.length, 1)
})

test("graph: records dependencies with their specifier and id", () => {
  const result = run('import "./a.js"; import "react"', { "./a.js": "const x = 1" })
  assert.deepEqual(
    result.modules.get("entry").dependencies.map(({ specifier, id, external }) => ({ specifier, id, external })),
    [
      { specifier: "./a.js", id: "./a.js", external: false },
      { specifier: "react", id: null, external: true }
    ]
  )
})
