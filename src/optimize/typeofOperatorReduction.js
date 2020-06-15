const isGlobalProperty = require('./utilities/isGlobalProperty')

function getTypeOfGlobalProperty (name) {
  switch (name) {
    case 'Infinity': return typeof Infinity
    case 'NaN': return typeof NaN
    case 'undefined': return typeof undefined
    case 'null': return typeof null
  }
}

module.exports = function typeofOperatorReduction (node) {
  if (node.type === 'UnaryExpression' && node.operator === 'typeof') {
    if (node.argument.type === 'Literal') {
      return { type: 'Literal', value: typeof node.argument.value }
    } else if (node.argument.type === 'ArrayExpression') {
      return { type: 'Literal', value: typeof [] }
    } else if (node.argument.type === 'ObjectExpression') {
      return { type: 'Literal', value: typeof {} }
    } else if (isGlobalProperty(node.argument)) {
      return { type: 'Literal', value: getTypeOfGlobalProperty(node.argument.name) }
    }
  }
  return node
}
