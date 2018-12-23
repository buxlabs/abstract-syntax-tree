const cherow = require('cherow')

module.exports = function parse (source, options) {
  return cherow.parseModule(source, options)
}
