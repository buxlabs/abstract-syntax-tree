class Literal {
  constructor (param) {
    this.type = 'Literal'
    const options = typeof param === 'string' ? { value: param } : param
    Object.assign(this, options)
  }
}

module.exports = Literal
