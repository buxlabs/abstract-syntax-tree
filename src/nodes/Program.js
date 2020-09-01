class Program {
  constructor (options) {
    this.type = 'Program'
    this.sourceType = 'script'
    this.body = []
    Object.assign(this, options)
  }
}

module.exports = Program
