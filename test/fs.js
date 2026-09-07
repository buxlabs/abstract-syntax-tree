const test = require("node:test")
const assert = require("node:assert")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const AbstractSyntaxTree = require("..")
const { modules, resolve } = require("../fs")

const { generate, bundle, graph } = AbstractSyntaxTree

// Each case gets its own directory so nothing depends on the working directory
// or on another test's files.
function project (files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ast-fs-"))
  for (const name of Object.keys(files)) {
    const file = path.join(root, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, files[name])
  }
  test.after(() => fs.rmSync(root, { recursive: true, force: true }))
  return root
}

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()
const relative = (root, ids) => ids.map((id) => path.relative(root, id))

// ---------------------------------------------------------------------------
// modules
// ---------------------------------------------------------------------------

test("fs: reads a file", () => {
  const root = project({ "a.js": "const a = 1" })
  assert.equal(modules(path.join(root, "a.js")), "const a = 1")
})

test("fs: returns undefined for a file that does not exist", () => {
  const root = project({})
  assert.equal(modules(path.join(root, "nope.js")), undefined)
})

test("fs: returns undefined for a directory", () => {
  const root = project({ "lib/a.js": "const a = 1" })
  assert.equal(modules(path.join(root, "lib")), undefined)
})

// ---------------------------------------------------------------------------
// resolve
// ---------------------------------------------------------------------------

test("fs: resolves a relative specifier against the importer", () => {
  const root = project({ "src/index.js": "", "src/a.js": "" })
  assert.equal(resolve("./a.js", path.join(root, "src/index.js")), path.join(root, "src/a.js"))
})

test("fs: resolves a parent directory specifier", () => {
  const root = project({ "src/lib/index.js": "", "src/a.js": "" })
  assert.equal(resolve("../a.js", path.join(root, "src/lib/index.js")), path.join(root, "src/a.js"))
})

test("fs: resolves an extensionless specifier", () => {
  const root = project({ "index.js": "", "a.js": "" })
  assert.equal(resolve("./a", path.join(root, "index.js")), path.join(root, "a.js"))
})

test("fs: resolves an mjs extension", () => {
  const root = project({ "index.js": "", "a.mjs": "" })
  assert.equal(resolve("./a", path.join(root, "index.js")), path.join(root, "a.mjs"))
})

test("fs: resolves a directory index", () => {
  const root = project({ "index.js": "", "a/index.js": "" })
  assert.equal(resolve("./a", path.join(root, "index.js")), path.join(root, "a/index.js"))
})

test("fs: returns null for a bare specifier", () => {
  const root = project({ "index.js": "" })
  assert.equal(resolve("react", path.join(root, "index.js")), null)
})

test("fs: returns null for a scheme specifier", () => {
  const root = project({ "index.js": "" })
  assert.equal(resolve("node:fs", path.join(root, "index.js")), null)
})

test("fs: returns undefined when nothing matches", () => {
  const root = project({ "index.js": "" })
  assert.equal(resolve("./nope.js", path.join(root, "index.js")), undefined)
})

test("fs: does not resolve against the working directory", () => {
  const root = project({ "src/index.js": "", "src/lib/a.js": "" })
  // "./lib/a.js" only exists under src, never at the process root
  assert.equal(resolve("./lib/a.js", path.join(root, "src/index.js")), path.join(root, "src/lib/a.js"))
})

// ---------------------------------------------------------------------------
// graph and bundle from disk
// ---------------------------------------------------------------------------

test("fs: graphs a project from disk", () => {
  const root = project({
    "src/index.js": 'import "./lib/a.js"',
    "src/lib/a.js": 'import "../b.js"',
    "src/b.js": "console.log(1)"
  })
  const entry = path.join(root, "src/index.js")
  const result = graph(modules(entry), { entry, modules, resolve })
  assert.deepEqual(relative(root, result.order), ["src/b.js", "src/lib/a.js", "src/index.js"])
})

test("fs: bundles a project from disk", () => {
  const root = project({
    "src/index.js": 'import { area } from "./lib/circle.js"\nconsole.log(area(2))',
    "src/lib/circle.js": 'import { PI } from "./constants.js"\nexport const area = (r) => PI * r * r\nexport const unused = 1',
    "src/lib/constants.js": "export const PI = 3.14"
  })
  const entry = path.join(root, "src/index.js")
  const tree = bundle(modules(entry), { entry, modules, resolve })
  assert.equal(output(tree), "const PI = 3.14; const area = r => PI * r * r; console.log(area(2));")
})

test("fs: reports a missing relative import rather than treating it as external", () => {
  const root = project({ "index.js": 'import "./nope.js"' })
  const entry = path.join(root, "index.js")
  assert.throws(
    () => graph(modules(entry), { entry, modules, resolve }),
    /Cannot resolve "\.\/nope\.js"/
  )
})

test("fs: keeps bare specifiers external", () => {
  const root = project({ "index.js": 'import React from "react"\nimport f from "node:fs"\nconsole.log(React, f)' })
  const entry = path.join(root, "index.js")
  const result = graph(modules(entry), { entry, modules, resolve })
  assert.deepEqual(result.externals, ["react", "node:fs"])
  assert.deepEqual(relative(root, result.order), ["index.js"])
})

test("fs: resolves a package specifier when a resolver is layered on top", () => {
  const root = project({
    "index.js": 'import { a } from "pkg"\nconsole.log(a)',
    "vendor/pkg.js": "export const a = 1"
  })
  const entry = path.join(root, "index.js")
  const tree = bundle(modules(entry), {
    entry,
    modules,
    resolve: (specifier, importer) =>
      specifier === "pkg" ? path.join(root, "vendor/pkg.js") : resolve(specifier, importer)
  })
  assert.equal(output(tree), "const a = 1; console.log(a);")
})
