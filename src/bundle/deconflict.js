const walk = require('../walk')

const KEYWORDS = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof',
  'interface', 'let', 'new', 'null', 'package', 'private', 'protected', 'public',
  'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield'
])

// A module id is an arbitrary key, so it has to be reduced to something that can
// appear in an identifier: "./lib/math.js" becomes "math", "3d.js" becomes "_3d".
function sanitize (id) {
  let base = String(id).replace(/\.[^./]*$/, '')
  base = base.slice(base.lastIndexOf('/') + 1)
  base = base.replace(/[^A-Za-z0-9_$]/g, '_')
  if (base === '' || /^[0-9]/.test(base) || KEYWORDS.has(base)) base = '_' + base
  return base
}

function names (modules) {
  // Every unresolved name in every module. Hoisting puts all module bodies in
  // one scope, so a top level binding that takes one of these would capture
  // another module's global.
  const reserved = new Set()
  // Every identifier anywhere, used only to keep a generated name from
  // colliding with a declaration nested inside some other module.
  const all = new Set()
  for (const module of modules) {
    for (const global of module.scope.globals) reserved.add(global.name)
    walk(module.tree, (node) => {
      if (node.type === 'Identifier') all.add(node.name)
    })
  }
  return { reserved, all }
}

function allocate (base, used, all) {
  if (!used.has(base)) {
    used.add(base)
    return base
  }
  let index = 1
  let name = `${base}$${index}`
  while (used.has(name) || all.has(name)) {
    index++
    name = `${base}$${index}`
  }
  used.add(name)
  return name
}

module.exports = { sanitize, names, allocate }
