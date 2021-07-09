const walk = require('../walk')
const equal = require('../equal')
const TYPES = require('../../types.json')
const esquery = require('esquery')

function isTypeSelector (selector) {
  return TYPES.includes(selector)
}

function isWildcardSelector (selector) {
  return selector === '*'
}

function isQuerySelector (selector) {
  return typeof selector === 'string'
}

function findByType (tree, selector) {
  return findByComparison(tree, { type: selector })
}

function findByWildcard (tree) {
  const nodes = []
  walk(tree, (node) => {
    nodes.push(node)
  })
  return nodes
}

function findByQuery (tree, selector) {
  return esquery(tree, selector)
}

function findByComparison (tree, selector) {
  const nodes = []
  walk(tree, (node) => {
    if (equal(node, selector)) {
      nodes.push(node)
    }
  })
  return nodes
}

module.exports = function find (tree, selector) {
  if (isTypeSelector(selector)) {
    return findByType(tree, selector)
  }
  if (isWildcardSelector(selector)) {
    return findByWildcard(tree)
  }
  if (isQuerySelector(selector)) {
    return findByQuery(tree, selector)
  }
  return findByComparison(tree, selector)
}
