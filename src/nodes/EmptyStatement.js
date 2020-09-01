const Statement = require('./Statement')

class EmptyStatement extends Statement {
  constructor (options) {
    super()
    this.type = 'EmptyStatement'
    Object.assign(this, options)
  }
}

module.exports = EmptyStatement
