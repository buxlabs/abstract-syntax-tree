const esquery = require('esquery')
const traverse = require('./traverse')
const equal = require('./equal')
const TYPES = require('../types.json')

module.exports = function find (tree, selector) {
  if (TYPES.includes(selector)) {
    selector = { type: selector }
  }
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
