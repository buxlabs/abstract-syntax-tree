const isGlobalProperty = require('./utilities/isGlobalProperty')

const LOGICAL_OPERATORS = ['&&', '||', '??']

function isLogicalOperator (operator) {
  return LOGICAL_OPERATORS.includes(operator)
}

function getGlobalProperty (name) {
  switch (name) {
    case 'Infinity': return Infinity
    case 'NaN': return NaN
    case 'undefined': return undefined
    case 'null': return null
  }
}

function getNodeValue (node) {
  return isGlobalProperty(node) ? getGlobalProperty(node.name) : node.value
}

function identifier (name) {
  return { type: 'Identifier', name }
}

function literal (value) {
  return { type: 'Literal', value }
}

function serialize (value) {
  switch (value) {
    case Infinity: return identifier('Infinity')
    case NaN: return identifier('NaN')
    case undefined: return identifier('undefined')
    case null: return identifier('null')
    default: return literal(value)
  }
}

function evaluate (operator, left, right) {
  switch (operator) {
    case '&&': return serialize(left && right)
    case '||': return serialize(left || right)
    case '??': return serialize(left ?? right)
  }
}

function isNodeSupported (node) {
  return node.type === 'Literal' || isGlobalProperty(node)
}

module.exports = function logicalExpressionReduction (node) {
  if (node.type === 'LogicalExpression' &&
    isNodeSupported(node.left) &&
    isNodeSupported(node.right) &&
    isLogicalOperator(node.operator)) {
    return evaluate(node.operator, getNodeValue(node.left), getNodeValue(node.right))
  }
  return node
}
