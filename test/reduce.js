const test = require('ava')
const AbstractSyntaxTree = require('..')
const { parse, reduce } = AbstractSyntaxTree

test('reduce (object oriented): works for numbers', assert => {
  const tree = new AbstractSyntaxTree('var a = 1, b = 2;')
  const value = tree.reduce((sum, node) => {
    if (node.type === 'Literal') {
      sum += node.value
    }
    return sum
  }, 0)
  assert.deepEqual(value, 3)
})

test('reduce (object oriented): works for objects', assert => {
  const tree = new AbstractSyntaxTree('var a = 1, b = 2; a = 3;')
  const value = tree.reduce((object, node) => {
    if (node.type === 'Identifier') {
      if (!object[node.name]) {
        object[node.name] = 1
      } else {
        object[node.name] += 1
      }
    }
    return object
  }, {})
  assert.deepEqual(value, { a: 2, b: 1 })
})

test('reduce (object oriented): works for arrays', assert => {
  const tree = new AbstractSyntaxTree('var a = 1, b = 2;')
  const value = tree.reduce((array, node) => {
    if (node.type === 'Literal') {
      array.push(node.value)
    }
    return array
  }, [])
  assert.deepEqual(value, [1, 2])
})

test('reduce (functional): works for numbers', assert => {
  const tree = parse('var answer = 42;')
  const value = reduce(tree, (sum, node) => {
    if (node.type === 'Literal') {
      sum += node.value
    }
    return sum
  }, 0)
  assert.deepEqual(value, 42)
})
