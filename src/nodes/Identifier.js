class Identifier {
  constructor (param) {
    this.type = 'Identifier'
    const options = typeof param === 'string' ? { name: param } : param
    Object.assign(this, options)
  }
}

module.exports = Identifier
