const find = require('./find')

module.exports = function first (tree, selector) {
  return find(tree, selector)[0]
}
