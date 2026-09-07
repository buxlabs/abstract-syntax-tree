const graph = require('../graph')
const scope = require('../scope')
const prune = require('../prune')
const program = require('../program')
const unshorthand = require('../rename/unshorthand')
const prepare = require('./exports')
const { declare, connect } = require('./link')
const { sanitize, names } = require('./deconflict')
const { resolve, text, keys } = require('./exports')

const KINDS = {
  ImportDefaultSpecifier: 'ImportDefaultSpecifier',
  ImportNamespaceSpecifier: 'ImportNamespaceSpecifier'
}

function key (exported) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(exported)
    ? { type: 'Identifier', name: exported }
    : { type: 'Literal', value: exported }
}

// Rebuilds the external imports that were kept, one declaration per source.
function imports (prologue) {
  const sources = []
  const grouped = new Map()
  for (const entry of prologue) {
    if (!grouped.has(entry.source)) {
      grouped.set(entry.source, [])
      sources.push(entry.source)
    }
    grouped.get(entry.source).push(entry)
  }
  return sources.map((source) => ({
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers: grouped.get(source).map((entry) => {
      const local = { type: 'Identifier', name: entry.local }
      const type = KINDS[entry.specifier.type]
      if (type) return { type, local }
      return { type: 'ImportSpecifier', imported: key(text(entry.specifier.imported)), local }
    })
  }))
}

// The entry's own exports are stripped with everyone else's and re-emitted here,
// because deconflicting can rename the binding behind a public name.
function exports (entry, lookup) {
  const specifiers = []
  for (const exported of keys(entry, lookup)) {
    const result = resolve(entry, exported, lookup)
    if (!result || result.ambiguous || result.external) continue
    const local = result.module.finals.get(result.local)
    if (!local) continue
    specifiers.push({
      type: 'ExportSpecifier',
      local: { type: 'Identifier', name: local },
      exported: key(exported)
    })
  }
  if (specifiers.length === 0) return []
  return [{ type: 'ExportNamedDeclaration', declaration: null, source: null, specifiers }]
}

module.exports = function bundle (tree, options = {}) {
  const result = graph(tree, options)
  if (options.cycles === 'throw' && result.cycles.length > 0) {
    const [cycle] = result.cycles
    throw new Error(`Circular dependency: ${cycle.join(' -> ')}`)
  }

  const modules = result.order.map((id) => result.modules.get(id))

  for (const module of modules) {
    prepare(module, `${sanitize(module.id)}_default`)
    module.finals = new Map()
  }
  for (const module of modules) {
    module.scope = scope(module.tree)
  }

  const { reserved, all } = names(modules)
  const used = new Set(reserved)
  const externals = new Map()
  const prologue = []

  const context = { used, all, modules: result.modules, externals, prologue, options }
  for (const module of modules) declare(module, context)
  for (const module of modules) connect(module, context)

  const entry = result.modules.get(result.entry)
  const lookup = (from, source) => {
    const dependency = from.dependencies.find((item) => item.specifier === source)
    return dependency && dependency.id ? result.modules.get(dependency.id) : null
  }

  const body = [...imports(prologue)]
  for (const module of modules) body.push(...module.tree.body)
  body.push(...exports(entry, lookup))

  const output = program(body)
  unshorthand(output)
  if (options.treeshake !== false) prune(output)
  return output
}
