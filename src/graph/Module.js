module.exports = class Module {
  constructor (id, tree) {
    this.id = id
    this.tree = tree
    // { specifier, id, external, node } - one per module syntax node that names
    // a source, in the order they appear
    this.dependencies = []
    this.imports = []
    this.exports = []
    // Whether the module was written as CommonJS and converted
    this.commonjs = false
  }

  get external () {
    return this.dependencies.filter((dependency) => dependency.external)
  }
}
