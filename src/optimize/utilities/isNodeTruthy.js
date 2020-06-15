const truthyValues = ['Infinity']
const falsyValues = ['undefined', 'NaN']

function isTruthy (value) {
  return !!value
}

module.exports = function isNodeTruthy (node) {
  if (node.type === 'Literal') {
    return isTruthy(node.value)
  } else if (node.type === 'ArrayExpression' || node.type === 'ObjectExpression') {
    return true
  } else if (node.type === 'Identifier' && truthyValues.includes(node.name)) {
    return true
  } else if (node.type === 'Identifier' && falsyValues.includes(node.name)) {
    return false
  } else if (node.type === 'UnaryExpression') {
    if (node.operator === 'void') {
      return false
    } else if (node.operator === '-' && node.argument.type === 'Identifier' && truthyValues.includes(node.argument.name)) {
      return true
    }
  } else if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return isTruthy(node.quasis[0].value.raw)
  }
}
