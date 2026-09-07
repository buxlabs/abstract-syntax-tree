const scope = require('../scope')
const Scope = require('../scope/Scope')
const unshorthand = require('./unshorthand')
const { targets, verify, apply } = require('./binding')

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

function own (scope, from) {
  const binding = scope.getBinding(from)
  return binding && binding.kind !== 'implicit' ? [binding] : []
}

function select (root, from, option) {
  if (option instanceof Scope) return own(option, from)
  if (option === 'all') {
    const bindings = []
    collect(root, from, bindings)
    return bindings
  }
  if (option === 'top') return own(root, from)
  throw new Error(
    `Invalid scope option: expected "all", "top" or a scope, got ${JSON.stringify(option)}`
  )
}

module.exports = function rename (tree, from, to, options = {}) {
  if (from === to) return tree

  const option = options.scope === undefined ? 'all' : options.scope
  const given = option instanceof Scope
  if (given && option.root.node !== tree) {
    throw new Error('Cannot rename: the given scope was analyzed from a different tree')
  }

  // Reusing the caller's analysis keeps the given scope's bindings identical to
  // the ones we rename; a fresh analyze would build an equivalent but separate
  // object graph that the caller could not have pointed at.
  const root = given ? option.root : scope(tree)
  const selected = select(root, from, option)

  const bindings = []
  for (const binding of selected) {
    for (const target of targets(root, binding)) {
      if (!bindings.includes(target)) bindings.push(target)
    }
  }

  // Every check runs before any mutation so a rejected rename leaves the tree
  // exactly as it was.
  for (const binding of bindings) {
    verify(binding, to)
  }

  if (bindings.length === 0) return tree

  for (const binding of bindings) {
    apply(binding, to)
  }

  return unshorthand(tree)
}
