const comparify = require('comparify')

module.exports = function equal (node1, node2) {
  return comparify(node1, node2)
}
