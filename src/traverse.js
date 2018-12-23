const estraverse = require('estraverse')

module.exports = function traverse (tree, options) {
  return estraverse.traverse(tree, options)
}
