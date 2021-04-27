function isPrimitive (param) {
  return typeof param === 'string' || typeof param === 'number' || typeof param === 'boolean' || param === null
}

class Literal {
  constructor (param) {
    this.type = 'Literal'
    const options = isPrimitive(param) ? { value: param } : param
    Object.assign(this, options)
  }
}

module.exports = Literal
