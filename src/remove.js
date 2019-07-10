const estraverse = require('estraverse')
const find = require('./find')
const equal = require('./equal')

function removeBySelector (tree, selector, options) {
  const nodes = find(tree, selector)
  removeByNode(tree, leaf => {
    for (let i = 0, ilen = nodes.length; i < ilen; i += 1) {
      if (equal(leaf, nodes[i])) {
        return true
      }
    }
    return false
  }, options)
}

function removeByCallback (tree, callback, options) {
  estraverse.replace(tree, {
    enter (current) {
      if (callback(current) === null) {
        return this.remove()
      }
    },
    leave (current) {
      if (isNodeEmpty(current)) {
        return this.remove()
      }
    }
  })
}

function removeByNode (tree, compare, options) {
  let count = 0
  estraverse.replace(tree, {
    enter (current) {
      if (options.first && count === 1) {
        return this.break()
      }
      if (compare(current)) {
        count += 1
        return this.remove()
      }
    },
    leave (current) {
      if (isNodeEmpty(current)) {
        return this.remove()
      }
    }
  })
}

function isExpressionEmpty (node) {
  return node.expression === null
}

function isVariableDeclarationEmpty (node) {
  return node.type === 'VariableDeclaration' && node.declarations.length === 0
}

function isNodeEmpty (node) {
  return isExpressionEmpty(node) || isVariableDeclarationEmpty(node)
}

module.exports = function remove (tree, handle, options = {}) {
  if (typeof handle === 'string') {
    return removeBySelector(tree, handle, options)
  } else if (typeof handle === 'function') {
    return removeByCallback(tree, handle, options)
  }
  removeByNode(tree, node => equal(node, handle), options)
}
