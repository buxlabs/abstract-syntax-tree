module.exports = class Reference {
  constructor (identifier, scope, parent, { read = true, write = false } = {}) {
    this.identifier = identifier
    this.scope = scope
    this.parent = parent
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
