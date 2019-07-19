const esquery = require('esquery')
const traverse = require('./traverse')
const equal = require('./equal')

module.exports = function find (tree, selector) {
  if (typeof selector === 'string') {
    return esquery(tree, selector)
  }
  const nodes = []
  traverse(tree, {
    enter (node) {
      if (equal(node, selector)) {
        nodes.push(node)
      }
    }
  })
  return nodes
}
