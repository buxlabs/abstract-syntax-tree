function getBody (node) {
  if (node && node.type === 'BlockStatement') {
    if (node.body.length === 1) {
      return node.body[0]
    }
    return node.body
  }
  return node
}

const isNodeTruthy = require('./utilities/isNodeTruthy')

module.exports = function ifStatementRemoval (node) {
  if (node.type === 'IfStatement') {
    const truthy = isNodeTruthy(node.test)
    if (typeof truthy === 'boolean') {
      if (truthy) {
        return getBody(node.consequent)
      } else {
        return getBody(node.alternate)
      }
    }
  }
  return node
}
