const walk = require('./walk')

module.exports = function mark (tree) {
  let cid = 1
  walk(tree, node => {
    node.cid = cid
    cid += 1
  })
}
