const Scope = require('./Scope')
const Reference = require('./Reference')

const SKIP_KEYS = new Set(['type', 'loc', 'range', 'start', 'end'])

module.exports = function analyze (tree) {
  const root = new Scope(tree.sourceType === 'script' ? 'global' : 'module', tree, null)
  const references = new Map()

  function reference (identifier, scope, parent, options) {
    const value = new Reference(identifier, scope, parent, options)
    scope.references.push(value)
    references.set(identifier, value)
    return value
  }

  function declare (scope, name, kind, identifier, node) {
    const target = kind === 'var' || kind === 'function' ? scope.variableScope : scope
    return target.declare(name, kind, identifier, node)
  }

  function visitChildren (node, scope) {
    for (const key in node) {
      if (SKIP_KEYS.has(key)) continue
      const value = node[key]
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child.type === 'string') visit(child, scope, node)
        }
      } else if (value && typeof value.type === 'string') {
        visit(value, scope, node)
      }
    }
  }

  // Declaration target, e.g. `const { a, b = c } = d` binds a and b.
  function bind (node, scope, kind, declaration) {
    if (!node) return
    switch (node.type) {
      case 'Identifier':
        declare(scope, node.name, kind, node, declaration || node)
        break
      case 'ObjectPattern':
        for (const property of node.properties) {
          if (property.type === 'RestElement') {
            bind(property.argument, scope, kind, declaration)
          } else {
            if (property.computed) visit(property.key, scope, property)
            bind(property.value, scope, kind, declaration)
          }
        }
        break
      case 'ArrayPattern':
        for (const element of node.elements) bind(element, scope, kind, declaration)
        break
      case 'AssignmentPattern':
        bind(node.left, scope, kind, declaration)
        visit(node.right, scope, node)
        break
      case 'RestElement':
        bind(node.argument, scope, kind, declaration)
        break
      default:
        visit(node, scope, node)
    }
  }

  // Assignment target, e.g. `[a, b] = c` writes to a and b without declaring them.
  function assign (node, scope, parent) {
    if (!node) return
    switch (node.type) {
      case 'Identifier':
        reference(node, scope, parent, { read: false, write: true })
        break
      case 'ObjectPattern':
        for (const property of node.properties) {
          if (property.type === 'RestElement') {
            assign(property.argument, scope, property)
          } else {
            if (property.computed) visit(property.key, scope, property)
            assign(property.value, scope, property)
          }
        }
        break
      case 'ArrayPattern':
        for (const element of node.elements) assign(element, scope, node)
        break
      case 'AssignmentPattern':
        assign(node.left, scope, node)
        visit(node.right, scope, node)
        break
      case 'RestElement':
        assign(node.argument, scope, node)
        break
      default:
        visit(node, scope, parent)
    }
  }

  function visitFunction (node, scope) {
    const inner = new Scope('function', node, scope)
    if (node.type === 'FunctionExpression' && node.id) {
      inner.declare(node.id.name, 'function', node.id, node)
    }
    if (node.type !== 'ArrowFunctionExpression') {
      inner.declare('arguments', 'implicit', null, node)
    }
    for (const param of node.params) bind(param, inner, 'param', node)
    if (node.body.type === 'BlockStatement') {
      for (const statement of node.body.body) visit(statement, inner, node.body)
    } else {
      visit(node.body, inner, node)
    }
    return inner
  }

  function visitClass (node, scope) {
    if (node.superClass) visit(node.superClass, scope, node)
    const inner = new Scope('class', node, scope)
    if (node.id) inner.declare(node.id.name, 'class', node.id, node)
    visit(node.body, inner, node)
    return inner
  }

  function visitForInOf (node, scope) {
    const inner = new Scope('for', node, scope)
    visit(node.right, scope, node)
    if (node.left.type === 'VariableDeclaration') {
      visit(node.left, inner, node)
    } else {
      assign(node.left, inner, node)
    }
    visit(node.body, inner, node)
  }

  const visitors = {
    Identifier (node, scope, parent) {
      reference(node, scope, parent, { read: true, write: false })
    },
    FunctionDeclaration (node, scope) {
      if (node.id) declare(scope, node.id.name, 'function', node.id, node)
      visitFunction(node, scope)
    },
    FunctionExpression (node, scope) {
      visitFunction(node, scope)
    },
    ArrowFunctionExpression (node, scope) {
      visitFunction(node, scope)
    },
    VariableDeclaration (node, scope) {
      for (const declarator of node.declarations) {
        bind(declarator.id, scope, node.kind, declarator)
        if (declarator.init) visit(declarator.init, scope, declarator)
      }
    },
    ClassDeclaration (node, scope) {
      if (node.id) declare(scope, node.id.name, 'class', node.id, node)
      visitClass(node, scope)
    },
    ClassExpression (node, scope) {
      visitClass(node, scope)
    },
    BlockStatement (node, scope) {
      const inner = new Scope('block', node, scope)
      for (const statement of node.body) visit(statement, inner, node)
    },
    StaticBlock (node, scope) {
      const inner = new Scope('block', node, scope)
      for (const statement of node.body) visit(statement, inner, node)
    },
    ForStatement (node, scope) {
      const inner = new Scope('for', node, scope)
      if (node.init) visit(node.init, inner, node)
      if (node.test) visit(node.test, inner, node)
      if (node.update) visit(node.update, inner, node)
      visit(node.body, inner, node)
    },
    ForInStatement: visitForInOf,
    ForOfStatement: visitForInOf,
    CatchClause (node, scope) {
      const inner = new Scope('catch', node, scope)
      if (node.param) bind(node.param, inner, 'catch', node)
      for (const statement of node.body.body) visit(statement, inner, node.body)
    },
    SwitchStatement (node, scope) {
      visit(node.discriminant, scope, node)
      const inner = new Scope('switch', node, scope)
      for (const switchCase of node.cases) {
        if (switchCase.test) visit(switchCase.test, inner, switchCase)
        for (const statement of switchCase.consequent) visit(statement, inner, switchCase)
      }
    },
    MemberExpression (node, scope) {
      visit(node.object, scope, node)
      if (node.computed) visit(node.property, scope, node)
    },
    Property (node, scope) {
      if (node.computed) visit(node.key, scope, node)
      visit(node.value, scope, node)
    },
    MethodDefinition (node, scope) {
      if (node.computed) visit(node.key, scope, node)
      visit(node.value, scope, node)
    },
    PropertyDefinition (node, scope) {
      if (node.computed) visit(node.key, scope, node)
      if (node.value) visit(node.value, scope, node)
    },
    AssignmentExpression (node, scope) {
      if (node.left.type === 'Identifier') {
        reference(node.left, scope, node, { read: node.operator !== '=', write: true })
      } else if (node.left.type === 'MemberExpression') {
        visit(node.left, scope, node)
      } else {
        assign(node.left, scope, node)
      }
      visit(node.right, scope, node)
    },
    UpdateExpression (node, scope) {
      if (node.argument.type === 'Identifier') {
        reference(node.argument, scope, node, { read: true, write: true })
      } else {
        visit(node.argument, scope, node)
      }
    },
    LabeledStatement (node, scope) {
      visit(node.body, scope, node)
    },
    BreakStatement () {},
    ContinueStatement () {},
    MetaProperty () {},
    ImportDeclaration (node, scope) {
      for (const specifier of node.specifiers) {
        declare(scope, specifier.local.name, 'import', specifier.local, specifier)
      }
    },
    ExportNamedDeclaration (node, scope) {
      if (node.declaration) {
        visit(node.declaration, scope, node)
      } else if (!node.source) {
        for (const specifier of node.specifiers) {
          reference(specifier.local, scope, specifier, { read: true, write: false })
        }
      }
    },
    ExportDefaultDeclaration (node, scope) {
      visit(node.declaration, scope, node)
    },
    ExportAllDeclaration () {}
  }

  function visit (node, scope, parent) {
    if (!node || typeof node.type !== 'string') return
    const visitor = visitors[node.type]
    if (visitor) {
      visitor(node, scope, parent)
    } else {
      visitChildren(node, scope)
    }
  }

  for (const statement of tree.body) visit(statement, root, tree)

  for (const value of references.values()) {
    const binding = value.scope.lookup(value.name)
    if (binding) {
      value.binding = binding
      binding.references.push(value)
    } else {
      let global = root.globals.find((item) => item.name === value.name)
      if (!global) {
        global = { name: value.name, references: [] }
        root.globals.push(global)
      }
      global.references.push(value)
    }
  }

  // node -> reference index backing Scope#getReference, kept off the enumerable
  // data model so the tree stays clean to inspect and serialize
  Object.defineProperty(root, '_references', { value: references })

  return root
}
