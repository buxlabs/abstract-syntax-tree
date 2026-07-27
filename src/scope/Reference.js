module.exports = class Reference {
  constructor (identifier, scope, { read = true, write = false } = {}) {
    this.identifier = identifier
    this.scope = scope
    this.binding = null
    this.read = read
    this.write = write
  }

  get name () {
    return this.identifier.name
  }

  get resolved () {
    return this.binding !== null
  }
}
