function key (exported) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(exported)
    ? { type: 'Identifier', name: exported }
    : { type: 'Literal', value: exported }
}

function getter (exported, local) {
  return {
    type: 'Property',
    kind: 'get',
    computed: false,
    shorthand: false,
    method: false,
    key: key(exported),
    value: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      generator: false,
      async: false,
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: local } }]
      }
    }
  }
}

// A namespace object has to stay live, so every name is a getter rather than a
// snapshot, and it is frozen with a null prototype to match the real thing.
module.exports = function namespace (name, entries) {
  const properties = [
    {
      type: 'Property',
      kind: 'init',
      computed: false,
      shorthand: false,
      method: false,
      key: { type: 'Identifier', name: '__proto__' },
      value: { type: 'Literal', value: null }
    }
  ]
  for (const entry of entries) {
    properties.push(getter(entry.exported, entry.local))
  }
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name },
        init: {
          type: 'CallExpression',
          optional: false,
          callee: {
            type: 'MemberExpression',
            computed: false,
            optional: false,
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'freeze' }
          },
          arguments: [{ type: 'ObjectExpression', properties }]
        }
      }
    ]
  }
}
