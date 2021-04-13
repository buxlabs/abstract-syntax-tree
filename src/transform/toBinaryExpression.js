const ArrayExpression = require('../nodes/ArrayExpression')
const BinaryExpression = require('../nodes/BinaryExpression')
const Literal = require('../nodes/Literal')

module.exports = function toBinaryExpression (input) {
  const expression = Array.isArray(input) ? new ArrayExpression({ elements: input }) : input
  if (expression.type === 'ArrayExpression') {
    const { elements } = expression
    if (elements.length === 0) {
      return new Literal({ value: '' })
    }
    if (elements.length === 1) {
      return elements[0]
    }
    if (elements.length === 2) {
      return new BinaryExpression({
        operator: '+',
        left: elements[0],
        right: elements[1]
      })
    }
    if (elements.length >= 3) {
      let expression = new BinaryExpression({
        operator: '+',
        left: elements[0],
        right: elements[1]
      })
      for (let index = 2; index < elements.length; index += 1) {
        expression = new BinaryExpression({
          operator: '+',
          left: expression,
          right: elements[index]
        })
      }
      return expression
    }
  }
  return expression
}
