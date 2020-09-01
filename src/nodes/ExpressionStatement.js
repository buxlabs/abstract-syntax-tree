const Statement = require('./Statement')

class ExpressionStatement extends Statement {
  constructor (options) {
    super()
    this.type = 'ExpressionStatement'
    this.expression = null
    Object.assign(this, options)
  }
}

module.exports = ExpressionStatement
