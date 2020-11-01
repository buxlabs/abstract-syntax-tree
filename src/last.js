const find = require('./find')

module.exports = function last (tree, selector) {
  const nodes = find(tree, selector)
  return nodes[nodes.length - 1]
}
