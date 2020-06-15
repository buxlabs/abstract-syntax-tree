const isNodeTruthy = require('./utilities/isNodeTruthy')

function isTruthy (value) {
  return !!value
}

module.exports = function ternaryOperatorReduction (node) {
  if (node.type === 'ConditionalExpression') {
    const truthy = isNodeTruthy(node.test)
    if (typeof truthy === 'boolean') {
      if (truthy) {
        return node.consequent
      } else {
        return node.alternate
      }
    }
  }
  return node
}
