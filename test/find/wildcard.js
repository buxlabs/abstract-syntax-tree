const test = require('ava')
const { parse, find } = require('../..')

test('find: by wildcard', async assert => {
  const tree = parse('const foo = \'bar\'')
  const nodes = find(tree, '*')
  assert.deepEqual(nodes.length, 5)
})
