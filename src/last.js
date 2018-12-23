const find = require('./find')

module.exports = function last (tree, selector) {
  var nodes = find(tree, selector)
  return nodes[nodes.length - 1]
}
