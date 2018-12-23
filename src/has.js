const count = require('./count')

module.exports = function has (tree, selector) {
  return count(tree, selector) > 0
}
