const count = require('./count')
const traverse = require('./traverse')
const equal = require('./equal')

module.exports = function has (tree, selector) {
  if (typeof selector === 'string') {
    return count(tree, selector) > 0
  }
  let found = false
  traverse(tree, {
    enter (node) {
      if (equal(node, selector)) {
        found = true
        return this.break()
      }
    }
  })
  return found
}
