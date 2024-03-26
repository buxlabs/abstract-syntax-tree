const test = require("node:test")
const assert = require("node:assert")
const { parse, find } = require("../..")

test("find: by wildcard", async () => {
  const tree = parse("const foo = 'bar'")
  const nodes = find(tree, "*")
  assert.deepEqual(nodes.length, 5)
})
