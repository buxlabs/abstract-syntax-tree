const test = require("node:test")
const assert = require("node:assert")
const { execFileSync } = require("node:child_process")
const AbstractSyntaxTree = require("..")
const { generate, bundle, graph } = AbstractSyntaxTree

const output = (tree) => generate(tree).replace(/\s+/g, " ").trim()
const run = (modules, options) => output(bundle(modules.entry, { modules, ...options }))
const evaluate = (modules, options) => {
  const source = generate(bundle(modules.entry, { modules, ...options }))
  return execFileSync(process.execPath, ["--input-type=module", "--eval", source], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim()
}

// ---------------------------------------------------------------------------
// imports
// ---------------------------------------------------------------------------

test("commonjs: converts a top level require", () => {
  assert.equal(
    run({
      entry: 'import a from "./a.js"; console.log(a)',
      "./a.js": 'const b = require("./b.js")\nmodule.exports = b',
      "./b.js": "module.exports = 1"
    }),
    "const b_default = 1; console.log(b_default);"
  )
})

test("commonjs: treats a require as a dependency", () => {
  const result = graph('const a = require("./a.js")\nmodule.exports = a', {
    modules: { "./a.js": "module.exports = 1" }
  })
  assert.deepEqual(result.order, ["./a.js", "entry"])
})

test("commonjs: converts a side effect only require", () => {
  assert.equal(
    run({ entry: 'require("./a.js")\nconsole.log(1)', "./a.js": "console.log(0)" }),
    "console.log(0); console.log(1);"
  )
})

test("commonjs: imports the whole value for a destructured require", () => {
  assert.equal(
    evaluate({
      entry: 'const { a, b } = require("./a.js")\nconsole.log(a + b)',
      "./a.js": "module.exports = { a: 1, b: 2 }"
    }),
    "3"
  )
})

test("commonjs: converts several requires in one declaration", () => {
  assert.equal(
    run({
      entry: 'const a = require("./a.js"), b = require("./b.js")\nconsole.log(a, b)',
      "./a.js": "module.exports = 1",
      "./b.js": "module.exports = 2"
    }),
    "const a_default = 1; const b_default = 2; console.log(a_default, b_default);"
  )
})

// ---------------------------------------------------------------------------
// exports
// ---------------------------------------------------------------------------

test("commonjs: exports an assigned identifier as the default", () => {
  assert.equal(
    run({
      entry: 'import f from "./a.js"; f()',
      "./a.js": "function f () {}\nmodule.exports = f"
    }),
    "function f() {} f();"
  )
})

test("commonjs: exports an assigned expression as the default", () => {
  assert.equal(
    run({ entry: 'import v from "./a.js"; console.log(v)', "./a.js": "module.exports = 1 + 2" }),
    "const a_default = 1 + 2; console.log(a_default);"
  )
})

test("commonjs: derives named exports from an exported object", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./a.js"; console.log(a)',
      "./a.js": "const a = 1\nconst b = 2\nmodule.exports = { a, b }"
    }),
    "const a = 1; console.log(a);"
  )
})

test("commonjs: derives a named export from a renamed key", () => {
  assert.equal(
    run({
      entry: 'import { outer } from "./a.js"; console.log(outer)',
      "./a.js": "const inner = 1\nmodule.exports = { outer: inner }"
    }),
    "const inner = 1; console.log(inner);"
  )
})

test("commonjs: keeps the default alongside named exports", () => {
  assert.equal(
    evaluate({
      entry: 'import all, { a } from "./a.js"; console.log(a, all.b)',
      "./a.js": "const a = 1\nconst b = 2\nmodule.exports = { a, b }"
    }),
    "1 2"
  )
})

test("commonjs: converts exports.name assignments", () => {
  assert.equal(
    run({
      entry: 'import { a } from "./a.js"; console.log(a)',
      "./a.js": "exports.a = 1\nexports.b = 2"
    }),
    "const a = 1; console.log(a);"
  )
})

test("commonjs: shakes an unused export out of a converted module", () => {
  const result = run({
    entry: 'import { a } from "./a.js"; console.log(a)',
    "./a.js": "const a = 1\nconst unused = 2\nmodule.exports = { a, unused }"
  })
  assert.ok(!result.includes("unused"), result)
})

// ---------------------------------------------------------------------------
// detection
// ---------------------------------------------------------------------------

test("commonjs: leaves a module alone", () => {
  assert.equal(
    run({ entry: 'import { a } from "./a.js"; a', "./a.js": "export const a = 1" }),
    "const a = 1; a;"
  )
})

test("commonjs: leaves a plain script alone", () => {
  assert.equal(run({ entry: "const a = 1; console.log(a)" }), "const a = 1; console.log(a);")
})

test("commonjs: reports which modules were converted", () => {
  const result = graph('import "./a.js"; import "./b.js"', {
    modules: { "./a.js": "module.exports = 1", "./b.js": "export const b = 2" }
  })
  assert.equal(result.modules.get("./a.js").commonjs, true)
  assert.equal(result.modules.get("./b.js").commonjs, false)
})

test("commonjs: can be turned off", () => {
  assert.throws(
    () =>
      run(
        { entry: 'import a from "./a.js"; a', "./a.js": "module.exports = 1" },
        { commonjs: false }
      ),
    /"default" is not exported/
  )
})

// ---------------------------------------------------------------------------
// refusals
// ---------------------------------------------------------------------------

const refuses = (source, pattern) => {
  assert.throws(() => run({ entry: 'import "./a.js"', "./a.js": source }), pattern)
}

test("commonjs: refuses a computed require", () => {
  refuses('const a = require(name)\nmodule.exports = a', /a require call with a computed specifier/)
})

test("commonjs: refuses a require inside a function", () => {
  refuses('module.exports = function () { return require("./b.js") }', /outside a top level declaration/)
})

test("commonjs: refuses a conditional require", () => {
  refuses('if (x) { require("./b.js") }\nmodule.exports = 1', /outside a top level declaration/)
})

test("commonjs: refuses __dirname", () => {
  refuses("module.exports = __dirname", /"__dirname"/)
})

test("commonjs: refuses __filename", () => {
  refuses("module.exports = __filename", /"__filename"/)
})

test("commonjs: refuses a reassigned module.exports", () => {
  refuses("module.exports = 1\nmodule.exports = 2", /assigned more than once/)
})

test("commonjs: refuses a reassigned exports property", () => {
  refuses("exports.a = 1\nexports.a = 2", /"exports.a" is assigned more than once/)
})

test("commonjs: refuses mixing module.exports and exports", () => {
  refuses("module.exports = {}\nexports.a = 1", /both assigned/)
})

test("commonjs: refuses a declaration that mixes require with other initializers", () => {
  refuses('const a = require("./b.js"), b = 2\nmodule.exports = a', /mixes require with other initializers/)
})

test("commonjs: names the module it refused", () => {
  refuses("module.exports = __dirname", /Cannot convert "\.\/a\.js" from CommonJS/)
})

// ---------------------------------------------------------------------------
// require, module and exports only mean CommonJS when they are free
// ---------------------------------------------------------------------------

test("commonjs: leaves a module that declares its own require", () => {
  assert.equal(
    run({ entry: 'function require (name) { return name.length }\nconst a = require("abc")\nconsole.log(a)' }),
    'function require(name) { return name.length; } const a = require("abc"); console.log(a);'
  )
})

test("commonjs: leaves a module that declares its own module", () => {
  assert.equal(
    run({ entry: "const module = { exports: {} }\nmodule.exports = 1\nconsole.log(module)" }),
    "const module = { exports: {} }; module.exports = 1; console.log(module);"
  )
})

test("commonjs: leaves a module that declares its own exports", () => {
  assert.equal(
    run({ entry: "const exports = {}\nexports.a = 1\nconsole.log(exports)" }),
    "const exports = {}; exports.a = 1; console.log(exports);"
  )
})

test("commonjs: allows a local binding named __dirname", () => {
  assert.equal(
    run({ entry: "function f (__dirname) { return __dirname }\nconsole.log(f(1))" }),
    "function f(__dirname) { return __dirname; } console.log(f(1));"
  )
})

test("commonjs: keeps the meaning of a module that shadows require", () => {
  assert.equal(
    evaluate({ entry: 'function require (name) { return name.length }\nconsole.log(require("abc"))' }),
    "3"
  )
})
