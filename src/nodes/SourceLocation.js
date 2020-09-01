class SourceLocation {
  constructor (options) {
    this.type = 'SourceLocation'
    this.source = null
    this.start = null
    this.end = null
    Object.assign(this, options)
  }
}

module.exports = SourceLocation
