const { terser } = require('rollup-plugin-terser')
const nodePolyfills = require('rollup-plugin-node-polyfills')
const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const virtual = require('@rollup/plugin-virtual')

module.exports = {
  input: 'index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'AbstractSyntaxTree'
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      plugins: [terser()],
      name: 'AbstractSyntaxTree'
    }
  ],
  plugins: [
    virtual({
      'source-map': 'export default {}'
    }),
    nodePolyfills(),
    nodeResolve(),
    commonjs(),
    json()
  ]
}
