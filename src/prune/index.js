const scope = require('../scope')
const remove = require('../remove')
const walk = require('../walk')
const isPure = require('./isPure')

const DECLARATION_KINDS = new Set(['var', 'let', 'const'])

// Only declarations that live directly in a statement list can be removed
// safely. Removing one from e.g. an unbraced `if (x) var y = 1` would leave a
// hole where a statement is required.
const STATEMENT_LISTS = new Set(['Program', 'BlockStatement', 'StaticBlock', 'SwitchCase'])

function collectSafe (tree) {
  const nodes = new Set()
  walk(tree, (node, parent) => {
    if (!parent || !STATEMENT_LISTS.has(parent.type)) return
    if (node.type === 'FunctionDeclaration') {
      nodes.add(node)
    } else if (node.type === 'VariableDeclaration') {
      for (const declarator of node.declarations) nodes.add(declarator)
    }
  })
  return nodes
}

// Declarations that are exported are part of the module's public interface and
// must be kept even when they are not referenced locally.
function collectExported (tree) {
  const nodes = new Set()
  walk(tree, (node) => {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      const declaration = node.declaration
      if (declaration.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations) nodes.add(declarator)
      } else {
        nodes.add(declaration)
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      nodes.add(node.declaration)
    }
  })
  return nodes
}

function prunable (binding, exported, safe) {
  if (binding.referenced) return false
  if (!safe.has(binding.node)) return false
  if (exported.has(binding.node)) return false
  if (binding.kind === 'function') return true
  if (DECLARATION_KINDS.has(binding.kind)) {
    return binding.node.id.type === 'Identifier' && isPure(binding.node.init)
  }
  return false
}

function collect (node, exported, safe, nodes) {
  for (const binding of node.bindings) {
    if (prunable(binding, exported, safe)) nodes.add(binding.node)
  }
  for (const child of node.children) collect(child, exported, safe, nodes)
}

function size (tree) {
  let count = 0
  walk(tree, () => {
    count += 1
  })
  return count
}

module.exports = function prune (tree) {
  // Removing a binding can leave another one unused, so keep going until a pass
  // no longer removes anything.
  while (true) {
    const root = scope(tree)
    const exported = collectExported(tree)
    const safe = collectSafe(tree)
    const nodes = new Set()
    collect(root, exported, safe, nodes)
    if (nodes.size === 0) break
    const before = size(tree)
    remove(tree, (node) => (nodes.has(node) ? null : node))
    if (size(tree) >= before) break
  }
  return tree
}
