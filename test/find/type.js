const test = require('ava')
const { parse, find } = require('../..')

test('find: by type (Program)', async assert => {
  const tree = parse('const foo = \'bar\'')
  const [node] = find(tree, 'Program')
  assert.deepEqual(node.type, 'Program')
})

test('find: by type (Identifier)', async assert => {
  const tree = parse('const foo = \'bar\'')
  const [node] = find(tree, 'Identifier')
  assert.deepEqual(node.name, 'foo')
})

test('find: by type (Literal)', async assert => {
  const tree = parse('const foo = \'bar\'')
  const [node] = find(tree, 'Literal')
  assert.deepEqual(node.value, 'bar')
})

test('find: by type (ArrowFunctionExpression)', async assert => {
  const tree = parse('(() => {})')
  const [node] = find(tree, 'ArrowFunctionExpression')
  assert.deepEqual(node.type, 'ArrowFunctionExpression')
})
