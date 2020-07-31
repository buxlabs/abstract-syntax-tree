class MemberExpression {
  constructor (options) {
    this.type = 'MemberExpression'
    this.computed = false
    Object.assign(this, options)
  }
}

module.exports = MemberExpression
