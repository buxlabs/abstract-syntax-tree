const template = require('./template')

function normalizeInput (input) {
  if (typeof input === 'string') return template(input)
  return input
}

function appendInput (tree, input) {
  if (Array.isArray(input)) {
    input.forEach(node => tree.push(node))
  } else {
    tree.push(input)
  }
}

module.exports = function append (tree, input) {
  input = normalizeInput(input)
  if (Array.isArray(tree)) {
    appendInput(tree, input)
  } else if (Array.isArray(tree.body)) {
    appendInput(tree.body, input)
  }
  return tree
}
