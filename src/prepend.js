const template = require('./template')

function getNode (input) {
  if (typeof input === 'string') return template(input)
  return input
}

function addNode (tree, node) {
  if (Array.isArray(node)) return node.concat(tree)
  tree.unshift(node)
  return tree
}

module.exports = function append (tree, input) {
  const node = getNode(input)
  if (Array.isArray(tree)) {
    tree = addNode(tree, node)
  } else if (Array.isArray(tree.body)) {
    tree.body = addNode(tree.body, node)
  }
  return tree
}
