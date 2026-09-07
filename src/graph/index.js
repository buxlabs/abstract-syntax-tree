const parse = require('../parse')
const Module = require('./Module')
const resolve = require('./resolve')
const commonjs = require('./commonjs')

function loader (modules) {
  if (typeof modules === 'function') return modules
  if (modules instanceof Map) return (id) => modules.get(id)
  return (id) => (Object.prototype.hasOwnProperty.call(modules, id) ? modules[id] : undefined)
}

function source (node) {
  if (node.type === 'ImportDeclaration') return node.source
  if (node.type === 'ExportAllDeclaration') return node.source
  if (node.type === 'ExportNamedDeclaration') return node.source
  return null
}

module.exports = function graph (tree, options = {}) {
  const entry = options.entry === undefined ? 'entry' : options.entry
  const load = loader(options.modules || {})
  const collect = options.missing === 'collect'

  // A loader can be backed by anything, including the filesystem, and
  // resolution probes several candidates per specifier. Reading each id at most
  // once keeps that from turning into repeated work.
  const sources = new Map()
  function cached (id) {
    if (sources.has(id)) return sources.get(id)
    const value = load(id)
    sources.set(id, value)
    return value
  }

  const modules = new Map()
  const order = []
  const cycles = []
  const externals = []
  const missing = []
  const visited = new Set()

  const entryTree = typeof tree === 'string' ? parse(tree) : tree

  function has (id) {
    return id === entry || cached(id) !== undefined
  }

  function read (id) {
    const value = id === entry ? entryTree : cached(id)
    if (value === undefined) return null
    return typeof value === 'string' ? parse(value) : value
  }

  function dependencies (module) {
    for (const node of module.tree.body) {
      if (node.type === 'ImportDeclaration') module.imports.push(node)
      if (node.type.startsWith('Export')) module.exports.push(node)

      const value = source(node)
      if (!value) continue

      const specifier = value.value
      const result = resolve(specifier, module.id, options, has)

      if (result.external) {
        if (!externals.includes(specifier)) externals.push(specifier)
        module.dependencies.push({ specifier, id: null, external: true, node })
        continue
      }
      if (result.missing) {
        if (!collect) {
          throw new Error(`Cannot resolve "${specifier}" from "${module.id}"`)
        }
        missing.push({ specifier, importer: module.id })
        module.dependencies.push({ specifier, id: null, external: false, missing: true, node })
        continue
      }
      module.dependencies.push({ specifier, id: result.id, external: false, node })
    }
  }

  function get (id) {
    const existing = modules.get(id)
    if (existing) return existing
    const parsed = read(id)
    if (!parsed) throw new Error(`Cannot resolve "${id}"`)
    // CommonJS is normalized into modules syntax first, so its requires are
    // seen as the dependencies they are and everything downstream deals with
    // one module system.
    const converted = options.commonjs === false ? false : commonjs(parsed, id)
    const module = new Module(id, parsed)
    module.commonjs = converted
    modules.set(id, module)
    dependencies(module)
    return module
  }

  // Post order, so a module is appended only after everything it depends on.
  // A back edge is recorded and skipped rather than followed, which both
  // terminates the walk and leaves the module at its first finishing position -
  // the order ESM itself evaluates a cycle in.
  function visit (id, stack) {
    if (visited.has(id)) return
    const index = stack.indexOf(id)
    if (index !== -1) {
      cycles.push([...stack.slice(index), id])
      return
    }
    stack.push(id)
    for (const dependency of get(id).dependencies) {
      if (dependency.id) visit(dependency.id, stack)
    }
    stack.pop()
    visited.add(id)
    order.push(id)
  }

  visit(entry, [])

  return { entry, modules, order, cycles, externals, missing }
}
