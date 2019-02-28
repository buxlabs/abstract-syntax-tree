const walk = require('./walk')

module.exports = function (tree, callback, accumulator) {
  walk(tree, node => {
    accumulator = callback(accumulator, node)
  })
  return accumulator
}
