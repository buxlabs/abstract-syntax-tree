const estemplate = require('estemplate')
const toAST = require('to-ast')

module.exports = function template (source, options) {
  options = options || {}
  if (typeof source === 'string') {
    return estemplate(source, options).body
  }
  return toAST(source, options)
}
