const Scope = require('./Scope')
const Reference = require('./Reference')

const SKIP_KEYS = new Set(['type', 'loc', 'range', 'start', 'end'])

module.exports = function analyze (tree) {
  const root = new Scope(tree.sourceType === 'script' ? 'global' : 'module', tree, null)
  const references = []

  function reference (identifier, scope, options) {
    const value = new Reference(identifier, scope, options)
    scope.references.push(value)
    references.push(value)
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
          if (child && typeof child.type === 'string') visit(child, scope)
        }
      } else if (value && typeof value.type === 'string') {
        visit(value, scope)
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
            if (property.computed) visit(property.key, scope)
            bind(property.value, scope, kind, declaration)
          }
        }
        break
      case 'ArrayPattern':
        for (const element of node.elements) bind(element, scope, kind, declaration)
        break
      case 'AssignmentPattern':
        bind(node.left, scope, kind, declaration)
        visit(node.right, scope)
        break
      case 'RestElement':
        bind(node.argument, scope, kind, declaration)
        break
      default:
        visit(node, scope)
    }
  }

  // Assignment target, e.g. `[a, b] = c` writes to a and b without declaring them.
  function assign (node, scope) {
    if (!node) return
    switch (node.type) {
      case 'Identifier':
        reference(node, scope, { read: false, write: true })
        break
      case 'ObjectPattern':
        for (const property of node.properties) {
          if (property.type === 'RestElement') {
            assign(property.argument, scope)
          } else {
            if (property.computed) visit(property.key, scope)
            assign(property.value, scope)
          }
        }
        break
      case 'ArrayPattern':
        for (const element of node.elements) assign(element, scope)
        break
      case 'AssignmentPattern':
        assign(node.left, scope)
        visit(node.right, scope)
        break
      case 'RestElement':
        assign(node.argument, scope)
        break
      default:
        visit(node, scope)
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
      for (const statement of node.body.body) visit(statement, inner)
    } else {
      visit(node.body, inner)
    }
    return inner
  }

  function visitClass (node, scope) {
    if (node.superClass) visit(node.superClass, scope)
    const inner = new Scope('class', node, scope)
    if (node.id) inner.declare(node.id.name, 'class', node.id, node)
    visit(node.body, inner)
    return inner
  }

  function visitForInOf (node, scope) {
    const inner = new Scope('for', node, scope)
    visit(node.right, scope)
    if (node.left.type === 'VariableDeclaration') {
      visit(node.left, inner)
    } else {
      assign(node.left, inner)
    }
    visit(node.body, inner)
  }

  const visitors = {
    Identifier (node, scope) {
      reference(node, scope, { read: true, write: false })
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
        if (declarator.init) visit(declarator.init, scope)
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
      for (const statement of node.body) visit(statement, inner)
    },
    StaticBlock (node, scope) {
      const inner = new Scope('block', node, scope)
      for (const statement of node.body) visit(statement, inner)
    },
    ForStatement (node, scope) {
      const inner = new Scope('for', node, scope)
      if (node.init) visit(node.init, inner)
      if (node.test) visit(node.test, inner)
      if (node.update) visit(node.update, inner)
      visit(node.body, inner)
    },
    ForInStatement: visitForInOf,
    ForOfStatement: visitForInOf,
    CatchClause (node, scope) {
      const inner = new Scope('catch', node, scope)
      if (node.param) bind(node.param, inner, 'catch', node)
      for (const statement of node.body.body) visit(statement, inner)
    },
    SwitchStatement (node, scope) {
      visit(node.discriminant, scope)
      const inner = new Scope('switch', node, scope)
      for (const switchCase of node.cases) {
        if (switchCase.test) visit(switchCase.test, inner)
        for (const statement of switchCase.consequent) visit(statement, inner)
      }
    },
    MemberExpression (node, scope) {
      visit(node.object, scope)
      if (node.computed) visit(node.property, scope)
    },
    Property (node, scope) {
      if (node.computed) visit(node.key, scope)
      visit(node.value, scope)
    },
    MethodDefinition (node, scope) {
      if (node.computed) visit(node.key, scope)
      visit(node.value, scope)
    },
    PropertyDefinition (node, scope) {
      if (node.computed) visit(node.key, scope)
      if (node.value) visit(node.value, scope)
    },
    AssignmentExpression (node, scope) {
      if (node.left.type === 'Identifier') {
        reference(node.left, scope, { read: node.operator !== '=', write: true })
      } else if (node.left.type === 'MemberExpression') {
        visit(node.left, scope)
      } else {
        assign(node.left, scope)
      }
      visit(node.right, scope)
    },
    UpdateExpression (node, scope) {
      if (node.argument.type === 'Identifier') {
        reference(node.argument, scope, { read: true, write: true })
      } else {
        visit(node.argument, scope)
      }
    },
    LabeledStatement (node, scope) {
      visit(node.body, scope)
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
        visit(node.declaration, scope)
      } else if (!node.source) {
        for (const specifier of node.specifiers) {
          reference(specifier.local, scope, { read: true, write: false })
        }
      }
    },
    ExportDefaultDeclaration (node, scope) {
      visit(node.declaration, scope)
    },
    ExportAllDeclaration () {}
  }

  function visit (node, scope) {
    if (!node || typeof node.type !== 'string') return
    const visitor = visitors[node.type]
    if (visitor) {
      visitor(node, scope)
    } else {
      visitChildren(node, scope)
    }
  }

  for (const statement of tree.body) visit(statement, root)

  for (const value of references) {
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

  return root
}
