class Function {
  constructor (options) {
    this.type = 'Function'
    this.generator = false
    Object.assign(this, options)
  }
}

module.exports = Function
