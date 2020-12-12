function serializeObjectExpression (node) {
  const object = {}
  node.properties.forEach(property => {
    const key = property.key.name || property.key.value
    object[key] = serialize(property.value)
  })
  return object
}

const NEW_EXPRESSION_OBJECTS = {
  Map,
  Set,
  WeakMap,
  WeakSet,
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError
}

function serializeNewExpression (node) {
  if (node.callee.type === 'Identifier') {
    const { name } = node.callee
    if (Object.keys(NEW_EXPRESSION_OBJECTS).includes(name)) {
      return new NEW_EXPRESSION_OBJECTS[name](node.arguments.map(serialize))
    }
  }
}

function serialize (node) {
  if (node.type === 'Literal') {
    if (node.regex) {
      return new RegExp(node.regex.pattern, node.regex.flags)
    }
    return node.value
  } else if (node.type === 'ArrayExpression') {
    return node.elements.map(serialize)
  } else if (node.type === 'ObjectExpression') {
    return serializeObjectExpression(node)
  } else if (node.type === 'NewExpression' && node.callee.type === 'Identifier') {
    const object = serializeNewExpression(node)
    if (object) {
      return object
    }
  } else if (node.type === 'CallExpression' && node.callee.name === 'Symbol') {
    return Symbol(...node.arguments.map(serialize))
  } else if (node.type === 'Identifier') {
    if (node.name === 'Infinity') {
      return Infinity
    } else if (node.name === 'NaN') {
      return NaN
    }
  }
}

module.exports = serialize
