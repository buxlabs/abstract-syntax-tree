class ArrayExpression {
  constructor (param) {
    this.type = 'ArrayExpression'
    const options = Array.isArray(param) ? { elements: param } : param
    Object.assign(this, options)
  }
}

module.exports = ArrayExpression
