import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  input: 'index.js',
  output: {
    file: 'build/ast.js',
    format: 'umd',
    name: 'AbstractSyntaxTree'
  },
  plugins: [
    json(),
    resolve({ preferBuiltins: true }),
    commonjs(),
    builtins(),
    uglify({}, minify)
  ]
}
