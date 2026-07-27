const Binding = require('./Binding')

module.exports = class Scope {
  constructor (type, node, parent) {
    this.type = type
    this.node = node
    this.parent = parent || null
    this.children = []
    this.bindings = []
    this.references = []
    this.globals = []
    if (parent) {
      parent.children.push(this)
    }
  }

  get root () {
    return this.parent ? this.parent.root : this
  }

  get variableScope () {
    if (this.type === 'module' || this.type === 'global' || this.type === 'function') {
      return this
    }
    return this.parent ? this.parent.variableScope : this
  }

  declare (name, kind, identifier, node) {
    let binding = this.getBinding(name)
    if (binding) {
      if (identifier) {
        binding.declarations.push(identifier)
      }
      return binding
    }
    binding = new Binding(name, kind, this, identifier, node)
    this.bindings.push(binding)
    return binding
  }

  getBinding (name) {
    return this.bindings.find((binding) => binding.name === name)
  }

  lookup (name) {
    return this.getBinding(name) || (this.parent && this.parent.lookup(name)) || null
  }
}
