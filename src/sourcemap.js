const { SourceMapGenerator } = require('source-map')
const generate = require('./generate')

module.exports = function sourcemap (tree) {
  const map = new SourceMapGenerator({ file: 'UNKNOWN' })
  const source = generate(tree, { sourceMap: map })
  return { source, map: map.toString() }
}
