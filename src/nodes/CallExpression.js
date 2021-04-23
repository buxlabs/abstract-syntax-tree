const Identifier = require('./Identifier')

class CallExpression {
  constructor (param, array) {
    this.type = 'CallExpression'
    const options = typeof param === 'string' ? { callee: new Identifier(param) } : param
    if (Array.isArray(array)) {
      options.arguments = array.map(param => {
        return typeof param === 'string' ? new Identifier(param) : param
      })
    }
    Object.assign(this, options)
  }
}

module.exports = CallExpression
