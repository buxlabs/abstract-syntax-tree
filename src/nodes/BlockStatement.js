const Statement = require('./Statement')

class BlockStatement extends Statement {
  constructor () {
    super()
    this.type = 'BlockStatement'
    this.body = []
  }
}

module.exports = BlockStatement
