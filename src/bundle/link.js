const rename = require('../rename')
const namespace = require('./namespace')
const { allocate } = require('./deconflict')
const { text, resolve, keys } = require('./exports')

function specifiers (module) {
  // Collected before anything is renamed, so the bindings are still reachable
  // by the names the source used.
  const result = []
  for (const node of module.tree.body) {
    if (node.type !== 'ImportDeclaration') continue
    for (const specifier of node.specifiers) {
      result.push({
        node,
        specifier,
        binding: module.scope.getBinding(specifier.local.name),
        source: node.source.value
      })
    }
  }
  return result
}

function imported (specifier) {
  if (specifier.type === 'ImportDefaultSpecifier') return 'default'
  if (specifier.type === 'ImportNamespaceSpecifier') return '*'
  return text(specifier.imported)
}

// Rewrites a `ns.foo` member expression into the identifier it resolves to. The
// member expression becomes an identifier in place, so the node keeps its
// position in whatever contains it.
function identifier (node, value) {
  for (const key of Object.keys(node)) delete node[key]
  node.type = 'Identifier'
  node.name = value
}

function member (reference) {
  const parent = reference.parent
  return parent &&
    parent.type === 'MemberExpression' &&
    !parent.computed &&
    parent.object === reference.identifier
    ? parent
    : null
}

// A binding nested between a reference and its declaration would capture that
// reference once the declaration takes the nested name, so the nested one moves
// to a fresh name first. This comes up when an import local is renamed to the
// name its target ended up with and the importing module happens to declare
// that name inside a function.
function clear (module, binding, to, context) {
  const conflicts = new Set()
  for (const reference of binding.references) {
    let current = reference.scope
    while (current && current !== binding.scope) {
      const existing = current.getBinding(to)
      if (existing) conflicts.add(existing)
      current = current.parent
    }
  }
  for (const conflict of conflicts) {
    rename(module.tree, conflict.name, allocate(conflict.name, context.used, context.all), {
      scope: conflict.scope
    })
  }
}

function move (module, binding, to, context) {
  const from = binding.name
  if (to === undefined) throw new Error(`Cannot resolve "${from}" in "${module.id}"`)
  if (from !== to) {
    clear(module, binding, to, context)
    rename(module.tree, from, to, { scope: module.scope })
  }
  module.finals.set(from, to)
}

// Every module's own declarations claim their names before any import is
// resolved. Splitting the two means a module in a cycle, which is linked before
// the dependency it imports from, still finds a final name to point at.
function declare (module, context) {
  const { used, all } = context
  module.links = specifiers(module)
  const skip = new Set(module.links.map((item) => item.binding))
  for (const binding of module.scope.bindings) {
    if (skip.has(binding) || binding.kind === 'implicit') continue
    move(module, binding, allocate(binding.name, used, all), context)
  }
  return module
}

function connect (module, context) {
  const { used, all, modules, externals, prologue, options } = context

  const lookup = (from, source) => {
    const dependency = from.dependencies.find((item) => item.specifier === source)
    return dependency && dependency.id ? modules.get(dependency.id) : null
  }

  const final = (result, exported, source) => {
    if (!result) throw new Error(`"${exported}" is not exported by "${source}"`)
    if (result.ambiguous) {
      throw new Error(`"${exported}" is exported by more than one module through "${source}"`)
    }
    const name = result.module.finals.get(result.local)
    if (name === undefined) throw new Error(`Cannot resolve "${exported}" from "${source}"`)
    return name
  }

  // A namespace the module re-exports has to exist as a real object, so it
  // cannot be dissolved into its member reads even when every use is static.
  const exported = new Set()
  for (const entry of module.exports.values()) {
    if (entry.kind === 'local') exported.add(entry.local)
  }

  for (const item of module.links) {
    const dependency = module.dependencies.find((entry) => entry.specifier === item.source)

    if (dependency.external) {
      // One local per external binding, shared across modules, so a package
      // imported by several modules still produces a single import.
      const key = imported(item.specifier)
      let registry = externals.get(item.source)
      if (!registry) {
        registry = new Map()
        externals.set(item.source, registry)
      }
      let local = registry.get(key)
      if (local === undefined) {
        local = allocate(item.binding.name, used, all)
        registry.set(key, local)
        prologue.push({ source: item.source, specifier: item.specifier, local })
      }
      move(module, item.binding, local, context)
      continue
    }

    const target = modules.get(dependency.id)

    if (item.specifier.type === 'ImportNamespaceSpecifier') {
      const entries = keys(target, lookup).map((name) => ({
        exported: name,
        local: final(resolve(target, name, lookup), name, dependency.id)
      }))
      const accesses = item.binding.references.map(member)

      if (
        options.namespace !== 'object' &&
        !exported.has(item.binding.name) &&
        accesses.every(Boolean)
      ) {
        // Every use is a static property read, so the object is never needed.
        for (const access of accesses) {
          const property = text(access.property)
          const entry = entries.find((candidate) => candidate.exported === property)
          if (!entry) throw new Error(`"${property}" is not exported by "${dependency.id}"`)
          identifier(access, entry.local)
        }
        continue
      }

      const local = allocate(item.binding.name, used, all)
      move(module, item.binding, local, context)
      module.tree.body.unshift(namespace(local, entries))
      continue
    }

    const wanted = imported(item.specifier)
    move(module, item.binding, final(resolve(target, wanted, lookup), wanted, dependency.id), context)
  }

  module.tree.body = module.tree.body.filter((node) => node.type !== 'ImportDeclaration')
  return module
}

module.exports = { declare, connect, imported }
