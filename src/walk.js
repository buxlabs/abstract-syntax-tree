const estraverse = require('estraverse')

module.exports = function walk (tree, callback) {
  return estraverse.traverse(tree, { enter: callback })
}
