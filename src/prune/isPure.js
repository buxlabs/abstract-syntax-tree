// A conservative check for initializers that can be dropped without changing
// observable behaviour. Anything that can execute user code (calls, member
// access through getters, class evaluation, await/yield, spread iteration, and
// so on) is treated as impure and therefore kept.

const PURE_TYPES = new Set([
  'Literal',
  'BigIntLiteral',
  'RegExpLiteral',
  'Identifier',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ThisExpression'
])

module.exports = function isPure (node) {
  if (!node) return true
  if (PURE_TYPES.has(node.type)) return true
  switch (node.type) {
    case 'ArrayExpression':
      return node.elements.every(
        (element) =>
          element === null || (element.type !== 'SpreadElement' && isPure(element))
      )
    case 'ObjectExpression':
      return node.properties.every(
        (property) =>
          property.type === 'Property' && !property.computed && isPure(property.value)
      )
    case 'TemplateLiteral':
      return node.expressions.every(isPure)
    case 'UnaryExpression':
      return node.operator !== 'delete' && isPure(node.argument)
    case 'BinaryExpression':
    case 'LogicalExpression':
      return isPure(node.left) && isPure(node.right)
    case 'ConditionalExpression':
      return isPure(node.test) && isPure(node.consequent) && isPure(node.alternate)
    case 'SequenceExpression':
      return node.expressions.every(isPure)
    default:
      return false
  }
}
