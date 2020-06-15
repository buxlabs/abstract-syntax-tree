const OPERATORS = ['+', '-', '*', '/', '%', '**', '===', '==', '!=', '!==', '>', '<', '>=', '<=', '&', '|', '^', '<<', '>>']

function isOperatorSupported (operator) {
  return OPERATORS.includes(operator)
}

function calculate (operator, left, right) {
  switch (operator) {
    case '+': return left + right
    case '-': return left - right
    case '*': return left * right
    case '/': return left / right
    case '%': return left % right
    case '**': return left ** right
    case '==': return left == right
    case '===': return left === right
    case '>': return left > right
    case '<': return left < right
    case '>=': return left >= right
    case '<=': return left <= right
    case '!==': return left !== right
    case '!=': return left != right
    case '&': return left & right
    case '|': return left | right
    case '^': return left ^ right
    case '<<': return left << right
    case '>>': return left >> right
  }
}

module.exports = function binaryExpressionReduction (node) {
  if (
    node.type === 'BinaryExpression' &&
    node.left.type === 'Literal' &&
    node.right.type === 'Literal' &&
    isOperatorSupported(node.operator)
  ) {
    return { type: 'Literal', value: calculate(node.operator, node.left.value, node.right.value) }
  }
  return node
}
