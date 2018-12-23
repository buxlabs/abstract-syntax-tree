const estraverse = require('estraverse')
const find = require('./find')
const equal = require('./equal')

function removeBySelector (tree, target, options) {
  var nodes = find(tree, target)
  // this could be improved by traversing once and
  // comparing the current node to the found nodes
  // one by one while making the array of nodes smaller too
  nodes.forEach(node => removeByNode(tree, node, options))
}

function removeByNode (tree, target, options) {
  var count = 0
  estraverse.replace(tree, {
    enter: function (current, parent) {
      if (options.first && count === 1) {
        return this.break()
      }
      if (equal(current, target)) {
        count += 1
        return this.remove()
      }
    },
    leave: function (current, parent) {
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

module.exports = function remove (tree, target, options = {}) {
  if (typeof target === 'string') {
    return removeBySelector(tree, target, options)
  }
  removeByNode(tree, target, options)
}
