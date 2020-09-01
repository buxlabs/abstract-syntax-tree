class Node {
  constructor (options) {
    this.type = 'Node'
    this.loc = null
    Object.assign(this, options)
  }
}

module.exports = Node
