module.exports = function prepend (tree, node) {
  if (Array.isArray(tree)) {
    tree.unshift(node)
  } else if (Array.isArray(tree.body)) {
    tree.body.unshift(node)
  }
  return tree
}
