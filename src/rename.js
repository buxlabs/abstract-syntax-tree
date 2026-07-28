const scope = require('./scope')
const walk = require('./walk')

function collect (node, from, bindings) {
  for (const binding of node.bindings) {
    if (binding.name === from && binding.kind !== 'implicit') {
      bindings.push(binding)
    }
  }
  for (const child of node.children) {
    collect(child, from, bindings)
  }
}

module.exports = function rename (tree, from, to) {
  if (from === to) return tree
  const root = scope(tree)
  const bindings = []
  collect(root, from, bindings)

  for (const binding of bindings) {
    const existing = binding.scope.getBinding(to)
    if (existing && existing !== binding) {
      throw new Error(
        `Cannot rename "${from}" to "${to}": "${to}" is already declared in the same scope`
      )
    }
  }

  if (bindings.length === 0) return tree

  for (const binding of bindings) {
    binding.name = to
    for (const identifier of binding.declarations) {
      identifier.name = to
    }
    for (const reference of binding.references) {
      reference.identifier.name = to
    }
  }

  // A shorthand property keeps its key and its local target in separate nodes
  // that share a name (`{ foo }` and `{ foo = 1 }`). Renaming only the local
  // would emit the wrong property, so once the two names diverge the property
  // has to be expanded (e.g. `{ foo }` becomes `{ foo: bar }`).
  walk(tree, (node) => {
    if (node.type !== 'Property' || !node.shorthand) return
    const local = node.value.type === 'AssignmentPattern' ? node.value.left : node.value
    if (local.type === 'Identifier' && node.key.name !== local.name) {
      node.shorthand = false
    }
  })

  return tree
}
