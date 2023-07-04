const traverse = require("./traverse")

module.exports = function walk(tree, callback) {
  return traverse(tree, { enter: callback })
}
