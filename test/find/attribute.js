const test = require('ava')
const { parse, find } = require('../..')

test('find: by attribute (name)', async assert => {
  const tree = parse('const foo = \'bar\'')
  const [node] = find(tree, '[name="foo"]')
  assert.deepEqual(node.name, 'foo')
})
