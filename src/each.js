const find = require('./find')

module.exports = function each (tree, selector, callback) {
  return find(tree, selector).forEach(callback)
}
