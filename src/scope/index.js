const analyze = require('./analyze')

module.exports = function scope (tree) {
  return analyze(tree)
}
