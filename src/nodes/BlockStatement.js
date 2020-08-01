const Statement = require('./Statement')

class BlockStatement extends Statement {
  constructor (options) {
    super()
    this.type = 'BlockStatement'
    this.body = []
    Object.assign(this, options)
  }
}

module.exports = BlockStatement
