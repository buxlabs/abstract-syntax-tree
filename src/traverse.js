const estraverse = require("./traverse/estraverse")

module.exports = function traverse(tree, options) {
  return estraverse.traverse(tree, options)
}
