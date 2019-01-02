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

function removeByNode (tree, compare, options) {
  let count = 0
  estraverse.replace(tree, {
    enter (current, parent) {
      if (options.first && count === 1) {
        return this.break()
      }
      if (compare(current)) {
        count += 1
        return this.remove()
      }
    },
    leave (current, parent) {
      if (
        current.expression === null ||
        (
          current.type === 'VariableDeclaration' &&
          current.declarations.length === 0
        )
      ) {
        return this.remove()
      }
    }
  })
}

module.exports = function remove (tree, selector, options = {}) {
  if (typeof selector === 'string') {
    return removeBySelector(tree, selector, options)
  }
  removeByNode(tree, node => equal(node, selector), options)
}
