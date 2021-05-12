const test = require('ava')
const { tmpdir } = require('os')
const { join } = require('path')
const rollup = require('rollup')
const config = require('../rollup.config')

test.skip('build: creates a valid bundle', async assert => {
  const bundle = await rollup.rollup(config)
  const file = join(tmpdir(), 'bundle.js')
  await bundle.write({
    ...config.output.find(object => object.file === 'dist/index.js'),
    file
  })
  const AbstractSyntaxTree = require(file)
  const tree = new AbstractSyntaxTree('const foo = 42')
  const literal = tree.find('Literal')
  assert.truthy(literal)
})
