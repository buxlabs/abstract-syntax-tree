const template = require('./template')

function normalizeInput (input) {
  if (typeof input === 'string') return template(input)
  return input
}

function prependNode (tree, input) {
  if (Array.isArray(input)) {
    input.reverse().forEach(node => tree.unshift(node))
  } else {
    tree.unshift(input)
  }
}

module.exports = function prepend (tree, input) {
  input = normalizeInput(input)
  if (Array.isArray(tree)) {
    prependNode(tree, input)
  } else if (Array.isArray(tree.body)) {
    prependNode(tree.body, input)
  }
  return tree
}
