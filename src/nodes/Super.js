class Super {
  constructor (options) {
    this.type = 'Super'
    Object.assign(this, options)
  }
}

module.exports = Super
