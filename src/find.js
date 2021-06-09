const esquery = require('esquery')
const traverse = require('./traverse')
const equal = require('./equal')
const TYPES = require('../types.json')

function findByType (tree, selector) {
  return findByComparison(tree, { type: selector })
}

function findByAttribute (tree, selector) {
  return esquery(tree, selector)
}

function findByComparison (tree, selector) {
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

function findByQuery (tree, selector) {
  return esquery(tree, selector)
}

function isTypeSelector (selector) {
  return TYPES.includes(selector)
}

function isAttributeSelector (selector) {
  return isQuerySelector(selector) && selector.startsWith('[') && selector.endsWith(']')
}

function isQuerySelector (selector) {
  return typeof selector === 'string'
}

module.exports = function find (tree, selector) {
  if (isTypeSelector(selector)) {
    return findByType(tree, selector)
  }
  if (isAttributeSelector(selector)) {
    return findByAttribute(tree, selector)
  }
  if (isQuerySelector(selector)) {
    return findByQuery(tree, selector)
  }
  return findByComparison(tree, selector)
}
