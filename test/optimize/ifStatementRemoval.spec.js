const test = require('ava')
const AbstractSyntaxTree = require('../..')
const { ifStatementRemoval } = require('../..')

test('ifStatementRemoval', assert => {
  var tree = new AbstractSyntaxTree('if (true) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if (true) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if (1) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if ("foo") { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if (`foo`) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if ([]) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if ({}) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if (Infinity) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('if (-Infinity) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("foo");\n')

  var tree = new AbstractSyntaxTree('const foo = "foo"; if (foo) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'const foo = "foo";\nif (foo) {\n  console.log("foo");\n} else {\n  console.log("bar");\n}\n')

  var tree = new AbstractSyntaxTree('if (false) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (null) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (undefined) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (0) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (NaN) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (void 0) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (void(0)) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (\'\') { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if ("") { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (``) { console.log("foo") } else { console.log("bar") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, 'console.log("bar");\n')

  var tree = new AbstractSyntaxTree('if (false) { console.log("foo") }')
  tree.replace(ifStatementRemoval)
  assert.deepEqual(tree.source, '')
})
