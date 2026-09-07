const walk = require('../walk')
const scope = require('../scope')

const ESM = new Set([
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration'
])

function call (node, free) {
  return (
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    free(node.callee)
  )
}

function source (node, free) {
  return call(node, free) &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal' &&
    typeof node.arguments[0].value === 'string'
    ? node.arguments[0].value
    : null
}

// `module.exports` on the left of an assignment, or `exports.name`.
function assigned (node, free) {
  if (node.type !== 'ExpressionStatement') return null
  const { expression } = node
  if (expression.type !== 'AssignmentExpression' || expression.operator !== '=') return null
  const left = expression.left
  if (left.type !== 'MemberExpression' || left.computed) return null
  if (left.object.type !== 'Identifier' || left.property.type !== 'Identifier') return null
  if (!free(left.object)) return null
  if (left.object.name === 'module' && left.property.name === 'exports') {
    return { kind: 'module', value: expression.right }
  }
  if (left.object.name === 'exports') {
    return { kind: 'named', name: left.property.name, value: expression.right }
  }
  return null
}

function unique (base, taken) {
  if (!taken.has(base)) return base
  let index = 1
  while (taken.has(`${base}$${index}`)) index++
  return `${base}$${index}`
}

function identifier (name) {
  return { type: 'Identifier', name }
}

function declaration (local, value) {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value },
    specifiers: local ? [{ type: 'ImportDefaultSpecifier', local: identifier(local) }] : []
  }
}

// Named exports for the statically known keys of `module.exports = { ... }`.
// Node does the same thing, so `import { a } from "cjs"` keeps working.
function properties (object, names) {
  const specifiers = []
  if (object.type !== 'ObjectExpression') return specifiers
  for (const property of object.properties) {
    if (property.type !== 'Property' || property.computed || property.kind !== 'init') continue
    if (property.key.type !== 'Identifier') continue
    if (property.value.type !== 'Identifier') continue
    if (!names.has(property.value.name)) continue
    specifiers.push({
      type: 'ExportSpecifier',
      local: identifier(property.value.name),
      exported: identifier(property.key.name)
    })
  }
  return specifiers
}

function refuse (id, reason) {
  throw new Error(`Cannot convert "${id}" from CommonJS: ${reason}`)
}

function detect (tree, free) {
  for (const node of tree.body) {
    if (ESM.has(node.type)) return false
  }
  for (const node of tree.body) {
    if (assigned(node, free)) return true
  }
  // Any require at all, not just a top level one. A require nested in a
  // function cannot be converted, and finding it here means it is refused by
  // name rather than left in the output as a call to nothing.
  let found = false
  walk(tree, (node) => {
    if (call(node, free)) found = true
  })
  return found
}

// Converts the static shape of a CommonJS module into the equivalent modules
// syntax, so the rest of the pipeline only ever deals with one module system.
// Only what can be understood without running the code is accepted; anything
// else is refused by name rather than translated into something that looks
// right and behaves differently.
module.exports = function commonjs (tree, id) {
  // `require`, `module` and `exports` only mean CommonJS when they are free.
  // A module that declares its own is an ordinary script, and converting it
  // would delete the declaration and change what the code does.
  const root = scope(tree)
  const free = (node) => {
    const reference = root.getReference(node)
    return reference !== null && reference.binding === null
  }

  if (!detect(tree, free)) return false

  const names = new Set()
  const taken = new Set()
  walk(tree, (node) => {
    if (node.type === 'Identifier') taken.add(node.name)
  })

  const allowed = new Set()
  const body = []
  let star = null
  const exported = new Map()

  for (const node of tree.body) {
    const target = assigned(node, free)

    if (target && target.kind === 'module') {
      if (star) refuse(id, '"module.exports" is assigned more than once')
      star = target.value
      body.push(node)
      continue
    }

    if (target && target.kind === 'named') {
      if (exported.has(target.name)) {
        refuse(id, `"exports.${target.name}" is assigned more than once`)
      }
      exported.set(target.name, target.value)
      body.push(node)
      continue
    }

    if (node.type === 'ExpressionStatement' && call(node.expression, free)) {
      const value = source(node.expression, free)
      if (value === null) refuse(id, 'a require call with a computed specifier')
      allowed.add(node.expression)
      body.push(declaration(null, value))
      continue
    }

    if (node.type === 'VariableDeclaration') {
      const requires = node.declarations.filter((declarator) => call(declarator.init, free))
      if (requires.length === 0) {
        body.push(node)
        continue
      }
      if (requires.length !== node.declarations.length) {
        refuse(id, 'a declaration that mixes require with other initializers')
      }
      for (const declarator of node.declarations) {
        const value = source(declarator.init, free)
        if (value === null) refuse(id, 'a require call with a computed specifier')
        allowed.add(declarator.init)
        if (declarator.id.type === 'Identifier') {
          names.add(declarator.id.name)
          body.push(declaration(declarator.id.name, value))
          continue
        }
        // A pattern reads properties off whatever the module exported, which is
        // only knowable at runtime, so the whole value is imported and the
        // pattern is kept as it was written.
        const local = unique(`${declarator.id.type === 'ObjectPattern' ? 'object' : 'array'}$cjs`, taken)
        taken.add(local)
        body.push(declaration(local, value))
        body.push({
          type: 'VariableDeclaration',
          kind: node.kind,
          declarations: [{ type: 'VariableDeclarator', id: declarator.id, init: identifier(local) }]
        })
      }
      continue
    }

    body.push(node)
  }

  walk(tree, (node) => {
    if (call(node, free) && !allowed.has(node)) {
      refuse(id, 'a require call outside a top level declaration')
    }
    if (node.type !== 'Identifier') return
    if (node.name !== '__dirname' && node.name !== '__filename') return
    if (free(node)) refuse(id, `"${node.name}"`)
  })

  for (const node of body) {
    if (node.type !== 'VariableDeclaration') continue
    for (const declarator of node.declarations) {
      if (declarator.id.type === 'Identifier') names.add(declarator.id.name)
    }
  }
  for (const node of body) {
    if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
      if (node.id) names.add(node.id.name)
    }
  }

  if (star && exported.size > 0) {
    refuse(id, '"module.exports" and "exports" are both assigned')
  }

  const result = body.filter((node) => !assigned(node, free))

  if (star) {
    const specifiers = properties(star, names)
    if (star.type === 'Identifier' && names.has(star.name)) {
      specifiers.unshift({
        type: 'ExportSpecifier',
        local: identifier(star.name),
        exported: identifier('default')
      })
      result.push({ type: 'ExportNamedDeclaration', declaration: null, source: null, specifiers })
    } else {
      result.push({ type: 'ExportDefaultDeclaration', declaration: star })
      if (specifiers.length > 0) {
        result.push({ type: 'ExportNamedDeclaration', declaration: null, source: null, specifiers })
      }
    }
  }

  for (const [name, value] of exported) {
    if (names.has(name)) refuse(id, `"exports.${name}" shadows a declaration`)
    result.push({
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration: {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: identifier(name), init: value }]
      }
    })
  }

  tree.body = result
  return true
}
