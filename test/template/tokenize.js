const test = require("node:test")
const assert = require("node:assert")
const tokenize = require("../../src/template/tokenize")

test("template: tokenizes code", () => {
  assert.deepEqual(tokenize('const foo = "bar";'), [
    { type: "code", value: 'const foo = "bar";' },
  ])
})

test("template: tokenizes expressions", () => {
  assert.deepEqual(tokenize("const foo = <%= bar %>"), [
    { type: "code", value: "const foo = " },
    { type: "expression", value: "bar" },
  ])
})
