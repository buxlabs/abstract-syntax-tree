const test = require("node:test")
const assert = require("node:assert")
const { parse, find } = require("../..")

test("find: by attribute (name)", async () => {
  const tree = parse("const foo = 'bar'")
  const [node] = find(tree, '[name="foo"]')
  assert.deepEqual(node.name, "foo")
})

test("find: by two attributes (name, type)", async () => {
  const tree = parse("const foo = 'bar'")
  const [node] = find(tree, '[name="foo"][type="Identifier"]')
  assert.deepEqual(node.name, "foo")
  assert.deepEqual(node.type, "Identifier")
})

test("find: by attribute existence (name)", async () => {
  const tree = parse("const foo = 'bar'")
  const [node] = find(tree, "[name]")
  assert.deepEqual(node.name, "foo")
})
