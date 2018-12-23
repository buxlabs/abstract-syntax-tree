module.exports = function append (tree, node) {
  if (Array.isArray(tree)) {
    tree.push(node)
  } else if (Array.isArray(tree.body)) {
    tree.body.push(node)
  }
  return tree
}
