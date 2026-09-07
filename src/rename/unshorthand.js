const walk = require('../walk')

// A shorthand property keeps its key and its local target in separate nodes
// that share a name (`{ foo }` and `{ foo = 1 }`). Renaming only the local
// would emit the wrong property, so once the two names diverge the property
// has to be expanded (e.g. `{ foo }` becomes `{ foo: bar }`).
//
// This stays a whole tree walk rather than a per binding fixup because a
// shorthand pattern records the property on no binding at all: for
// `const { foo } = x` the binding's node is the declarator.
module.exports = function unshorthand (tree) {
  walk(tree, (node) => {
    if (node.type !== 'Property' || !node.shorthand) return
    const local = node.value.type === 'AssignmentPattern' ? node.value.left : node.value
    if (local.type === 'Identifier' && node.key.name !== local.name) {
      node.shorthand = false
    }
  })
  return tree
}
