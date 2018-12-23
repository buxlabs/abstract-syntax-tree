const find = require('./find')

module.exports = function count (tree, selector) {
  return find(tree, selector).length
}
