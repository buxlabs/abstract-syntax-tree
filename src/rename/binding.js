function subtree (scope, result = []) {
  result.push(scope)
  for (const child of scope.children) {
    subtree(child, result)
  }
  return result
}

function contains (ancestor, scope) {
  let current = scope
  while (current) {
    if (current === ancestor) return true
    current = current.parent
  }
  return false
}

// Two bindings can share a declaring identifier. A class declares its own name
// twice, once in the enclosing scope and once in the class scope, and both
// bindings point at the same `node.id`. Renaming one of them rewrites
// `class Foo` while leaving the self references in the body bound to a name
// that no longer exists, so the pair has to move together.
function targets (root, binding) {
  const result = [binding]
  if (!binding.identifier) return result
  for (const scope of subtree(root)) {
    for (const item of scope.bindings) {
      if (item !== binding && item.identifier === binding.identifier) {
        result.push(item)
      }
    }
  }
  return result
}

// Renaming can rebind identifiers that are not part of the rename at all, and
// the result is valid code that means something else. Both directions have to
// be rejected: the binding's own references falling into an inner declaration
// of the new name, and references that used to reach past this scope starting
// to resolve here instead.
function verify (binding, to) {
  const existing = binding.scope.getBinding(to)
  if (existing && existing !== binding) {
    throw new Error(
      `Cannot rename "${binding.name}" to "${to}": "${to}" is already declared in the same scope`
    )
  }

  for (const reference of binding.references) {
    let current = reference.scope
    while (current && current !== binding.scope) {
      if (current.getBinding(to)) {
        throw new Error(
          `Cannot rename "${binding.name}" to "${to}": a reference to "${binding.name}" would be captured by "${to}" declared in an inner scope`
        )
      }
      current = current.parent
    }
  }

  for (const scope of subtree(binding.scope)) {
    for (const reference of scope.references) {
      if (reference.name !== to) continue
      if (!reference.binding || !contains(binding.scope, reference.binding.scope)) {
        throw new Error(
          `Cannot rename "${binding.name}" to "${to}": an existing reference to "${to}" would be shadowed by the renamed binding`
        )
      }
    }
  }
}

function apply (binding, to) {
  binding.name = to
  for (const identifier of binding.declarations) {
    identifier.name = to
  }
  for (const reference of binding.references) {
    reference.identifier.name = to
  }
  return binding
}

module.exports = { targets, verify, apply }
