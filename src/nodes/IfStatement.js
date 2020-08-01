const Statement = require('./Statement')

class IfStatement extends Statement {
  constructor (options) {
    super()
    this.type = 'IfStatement'
    this.test = null
    this.consequent = null
    this.alternate = null
    Object.assign(this, options)
  }
}

module.exports = IfStatement
