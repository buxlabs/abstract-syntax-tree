const GLOBAL_PROPERTIES = ['Infinity', 'NaN', 'undefined', 'null']

module.exports = function isGlobalProperty (node) {
  return node.type === 'Identifier' && GLOBAL_PROPERTIES.includes(node.name)
}
