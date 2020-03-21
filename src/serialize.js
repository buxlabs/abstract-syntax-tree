const asttv = require('asttv')

function serialize (node) {
  return asttv(node)
}

module.exports = serialize
