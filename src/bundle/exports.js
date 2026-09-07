const walk = require('../walk')

function name (node) {
  return node.type === 'Identifier' ? node.name : node.value
}

function bound (node, result = []) {
  if (!node) return result
  switch (node.type) {
    case 'Identifier':
      result.push(node.name)
      break
    case 'ObjectPattern':
      for (const property of node.properties) {
        bound(property.type === 'RestElement' ? property.argument : property.value, result)
      }
      break
    case 'ArrayPattern':
      for (const element of node.elements) bound(element, result)
      break
    case 'AssignmentPattern':
      bound(node.left, result)
      break
    case 'RestElement':
      bound(node.argument, result)
      break
  }
  return result
}

function declared (declaration) {
  if (declaration.type === 'VariableDeclaration') {
    const result = []
    for (const declarator of declaration.declarations) bound(declarator.id, result)
    return result
  }
  return declaration.id ? [declaration.id.name] : []
}

// Turns a default export into an ordinary declaration so that everything after
// this point deals with plain bindings. An anonymous default has no binding at
// all, so one is created under the given name.
function defaults (node, fallback) {
  const declaration = node.declaration
  if (
    (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') &&
    declaration.id
  ) {
    return { local: declaration.id.name, node: declaration }
  }
  if (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') {
    declaration.id = { type: 'Identifier', name: fallback }
    return { local: fallback, node: declaration }
  }
  return {
    local: fallback,
    node: {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: fallback },
          init: declaration
        }
      ]
    }
  }
}

function unique (base, tree) {
  const taken = new Set()
  walk(tree, (node) => {
    if (node.type === 'Identifier') taken.add(node.name)
  })
  if (!taken.has(base)) return base
  let index = 1
  while (taken.has(`${base}$${index}`)) index++
  return `${base}$${index}`
}

// Reads a module's public surface and rewrites its body so no module syntax is
// left except the imports, which linking needs. Import declarations are kept
// here and removed once their specifiers have been resolved.
module.exports = function prepare (module, fallback) {
  const exports = new Map()
  const stars = []
  const body = []

  for (const node of module.tree.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        for (const local of declared(node.declaration)) {
          exports.set(local, { kind: 'local', local })
        }
        body.push(node.declaration)
      } else if (node.source) {
        for (const specifier of node.specifiers) {
          exports.set(name(specifier.exported), {
            kind: 'reexport',
            source: node.source.value,
            imported: name(specifier.local)
          })
        }
      } else {
        for (const specifier of node.specifiers) {
          exports.set(name(specifier.exported), { kind: 'local', local: name(specifier.local) })
        }
      }
      continue
    }

    if (node.type === 'ExportDefaultDeclaration') {
      const result = defaults(node, fallback)
      exports.set('default', { kind: 'local', local: result.local })
      body.push(result.node)
      continue
    }

    if (node.type === 'ExportAllDeclaration') {
      if (node.exported) {
        // `export * as ns from "m"` is the same thing as importing the
        // namespace and exporting it, and that path is already handled.
        const local = unique(name(node.exported), module.tree)
        body.push({
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: node.source.value },
          specifiers: [
            { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: local } }
          ]
        })
        exports.set(name(node.exported), { kind: 'local', local })
      } else {
        stars.push(node.source.value)
      }
      continue
    }

    body.push(node)
  }

  module.tree.body = body
  module.exports = exports
  module.stars = stars
  return module
}

module.exports.text = name

function same (a, b) {
  return a.module === b.module && a.local === b.local
}

// Follows an exported name to the module that actually declares it, through any
// number of re-exports. A star never carries a default, and two stars offering
// the same name make it ambiguous, so it is excluded rather than guessed at.
function resolve (module, exported, lookup, seen = new Set()) {
  const key = module.id + " " + exported
  if (seen.has(key)) return null
  seen.add(key)

  const entry = module.exports.get(exported)
  if (entry) {
    if (entry.kind === 'local') return { module, local: entry.local }
    const target = lookup(module, entry.source)
    if (!target) return { external: true, source: entry.source, imported: entry.imported }
    return resolve(target, entry.imported, lookup, seen)
  }

  if (exported === 'default') return null

  const found = []
  for (const source of module.stars) {
    const target = lookup(module, source)
    if (!target) continue
    const result = resolve(target, exported, lookup, seen)
    if (result && !found.some((item) => same(item, result))) found.push(result)
  }
  if (found.length === 0) return null
  if (found.length > 1) return { ambiguous: true }
  return found[0]
}

// Every name a module exports, including the ones it forwards with a star.
function keys (module, lookup, seen = new Set()) {
  if (seen.has(module.id)) return []
  seen.add(module.id)
  const result = [...module.exports.keys()]
  for (const source of module.stars) {
    const target = lookup(module, source)
    if (!target) continue
    for (const key of keys(target, lookup, seen)) {
      if (key !== 'default' && !result.includes(key)) result.push(key)
    }
  }
  return result
}

module.exports.resolve = resolve
module.exports.keys = keys
