const esquery = require('esquery')

module.exports = function find (tree, selector) {
  return esquery(tree, selector)
}
