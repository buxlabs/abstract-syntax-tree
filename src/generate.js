const astring = require("astring")

const generator = {
  JSXElement(node, state) {
    state.write("<")
    this[node.openingElement.type](node.openingElement, state)
    if (node.closingElement) {
      state.write(">")
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i]
        this[child.type](child, state)
      }
      state.write("</")
      this[node.closingElement.type](node.closingElement, state)
      state.write(">")
    } else {
      state.write(" />")
    }
  },
  JSXOpeningElement(node, state) {
    this[node.name.type](node.name, state)
    for (let i = 0; i < node.attributes.length; i += 1) {
      const attribute = node.attributes[i]
      this[attribute.type](attribute, state)
    }
  },
  JSXClosingElement(node, state) {
    this[node.name.type](node.name, state)
  },
  JSXIdentifier(node, state) {
    state.write(node.name)
  },
  JSXText(node, state) {
    state.write(node.value)
  },
  JSXMemberExpression(node, state) {
    this[node.object.type](node.object, state)
    state.write(".")
    this[node.property.type](node.property, state)
  },
  JSXAttribute(node, state) {
    state.write(" ")
    this[node.name.type](node.name, state)
    state.write("=")
    this[node.value.type](node.value, state)
  },
  JSXNamespacedName(node, state) {
    this[node.namespace.type](node.namespace, state)
    state.write(":")
    this[node.name.type](node.name, state)
  },
  JSXExpressionContainer(node, state) {
    state.write("{")
    this[node.expression.type](node.expression, state)
    state.write("}")
  },
  ...astring.GENERATOR,
}

module.exports = function generate(tree, options = {}) {
  return astring.generate(tree, { generator, ...options })
}
