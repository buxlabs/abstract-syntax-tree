const Statement = require('./Statement')

class EmptyStatement extends Statement {
  constructor () {
    super()
    this.type = 'EmptyStatement'
  }
}

module.exports = EmptyStatement
