module.exports = function memberExpressionReduction (node) {
  if (
    node.type === "MemberExpression" &&
    node.object.type === "ObjectExpression" &&
    node.property.type === "Identifier"
  ) {
    const property = node.object.properties.find(property => property.key.type === 'Identifier' && property.key.name === node.property.name)
    if (property && property.value.type === 'Literal') {
      return property.value
    }
  }
  return node
}
