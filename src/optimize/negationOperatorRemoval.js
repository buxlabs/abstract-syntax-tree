function isComparisonOperator (operator) {
  return (/^(==|===|!=|!==|<|>|<=|>=)$/).test(operator)
}

function getNegatedOperator (operator) {
  if (operator === '===') return '!=='
  if (operator === '<') return '>='
  if (operator === '>') return '<='
  if (operator === '>=') return '<'
  if (operator === '<=') return '>'
  if (operator === '==') return '!='
  if (operator === '!=') return '=='
  if (operator === '!==') return '==='
}

module.exports = function negationOperatorRemoval (node) {
  if (
    node.type === 'UnaryExpression' &&
    node.operator === '!' &&
    node.argument.type === 'BinaryExpression' &&
    isComparisonOperator(node.argument.operator)
  ) {
    node.argument.operator = getNegatedOperator(node.argument.operator)
    return node.argument
  }
  return node
}
