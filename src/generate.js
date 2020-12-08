const astring = require('astring')

const generator = {
  ...astring.baseGenerator,
  ImportExpression (node, state) {
    state.write('import(')
    this[node.source.type](node.source, state)
    state.write(')')
  }
}

module.exports = function generate (tree, options) {
  return astring.generate(tree, { generator, ...options })
}
