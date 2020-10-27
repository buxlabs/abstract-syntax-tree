const test = require('ava')
const AbstractSyntaxTree = require('../..')
const { negationOperatorRemoval } = require('../..')

test('negationOperatorRemoval', assert => {
  var tree = new AbstractSyntaxTree('if (!(foo === bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo !== bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo < bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo >= bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo > bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo <= bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo >= bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo < bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo <= bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo > bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo != bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo == bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo !== bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo === bar) {\n  console.log("foo");\n}\n')

  var tree = new AbstractSyntaxTree('if (!(foo == bar)) { console.log("foo") }\n')
  tree.replace(negationOperatorRemoval)
  assert.deepEqual(tree.source, 'if (foo != bar) {\n  console.log("foo");\n}\n')
})
