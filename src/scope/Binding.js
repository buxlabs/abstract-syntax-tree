module.exports = class Binding {
  constructor (name, kind, scope, identifier, node) {
    this.name = name
    this.kind = kind
    this.scope = scope
    this.identifier = identifier
    this.declarations = identifier ? [identifier] : []
    this.node = node
    this.references = []
  }

  get referenced () {
    return this.references.length > 0
  }

  get constant () {
    return this.references.every((reference) => !reference.write)
  }

  get reads () {
    return this.references.filter((reference) => reference.read)
  }

  get writes () {
    return this.references.filter((reference) => reference.write)
  }
}
