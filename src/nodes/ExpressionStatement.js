const Statement = require('./Statement')

class ExpressionStatement extends Statement {
  constructor () {
    super()
    this.type = 'ExpressionStatement'
    this.expression = null
  }
}

module.exports = ExpressionStatement
