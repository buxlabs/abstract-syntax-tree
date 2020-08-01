const find = require('./src/find')
const each = require('./src/each')
const first = require('./src/first')
const last = require('./src/last')
const count = require('./src/count')
const equal = require('./src/equal')
const has = require('./src/has')
const remove = require('./src/remove')
const prepend = require('./src/prepend')
const append = require('./src/append')
const replace = require('./src/replace')
const walk = require('./src/walk')
const traverse = require('./src/traverse')
const generate = require('./src/generate')
const parse = require('./src/parse')
const reduce = require('./src/reduce')
const template = require('./src/template')
const serialize = require('./src/serialize')
const sourcemap = require('./src/sourcemap')
const mark = require('./src/mark')
const EmptyStatement = require('./src/nodes/EmptyStatement')
const BlockStatement = require('./src/nodes/BlockStatement')
const ExpressionStatement = require('./src/nodes/ExpressionStatement')
const BinaryExpression = require('./src/nodes/BinaryExpression')
const MemberExpression = require('./src/nodes/MemberExpression')
const Literal = require('./src/nodes/Literal')
const Identifier = require('./src/nodes/Identifier')
const Program = require('./src/nodes/Program')
const Function = require('./src/nodes/Function')
const Node = require('./src/nodes/Node')
const SourceLocation = require('./src/nodes/SourceLocation')
const IfStatement = require('./src/nodes/IfStatement')

class AbstractSyntaxTree {
  static find (tree, selector) {
    return find(tree, selector)
  }

  static each (tree, selector, callback) {
    return each(tree, selector, callback)
  }

  static first (tree, selector) {
    return first(tree, selector)
  }

  static last (tree, selector) {
    return last(tree, selector)
  }

  static count (tree, selector) {
    return count(tree, selector)
  }

  static has (tree, selector) {
    return has(tree, selector)
  }

  static remove (tree, target, options) {
    return remove(tree, target, options)
  }

  static prepend (tree, node) {
    return prepend(tree, node)
  }

  static append (tree, node) {
    return append(tree, node)
  }

  static equal (node1, node2) {
    return equal(node1, node2)
  }

  static generate (tree, options) {
    return generate(tree, options)
  }

  static parse (source, options) {
    return parse(source, options)
  }

  static walk (tree, callback) {
    return walk(tree, callback)
  }

  static serialize (node) {
    return serialize(node)
  }

  static traverse (tree, callback) {
    return traverse(tree, callback)
  }

  static replace (tree, callback) {
    return replace(tree, callback)
  }

  static template (source, options) {
    return template(source, options)
  }

  static reduce (tree, callback, accumulator) {
    return reduce(tree, callback, accumulator)
  }

  constructor (source = '', options = {}) {
    if (typeof source === 'string') {
      this._tree = parse(source, { loc: true, ...options })
    } else {
      this._tree = source
    }
  }

  get type () {
    return this._tree.type
  }

  get body () {
    return this._tree.body
  }

  get source () {
    return generate(this._tree)
  }

  get map () {
    return sourcemap(this._tree).map
  }

  set body (body) {
    this._tree.body = body
  }

  find (selector) {
    return find(this._tree, selector)
  }

  each (selector, callback) {
    return each(this._tree, selector, callback)
  }

  first (selector) {
    return first(this._tree, selector)
  }

  last (selector) {
    return last(this._tree, selector)
  }

  count (selector) {
    return count(this._tree, selector)
  }

  has (selector) {
    return has(this._tree, selector)
  }

  remove (target, options) {
    return remove(this._tree, target, options)
  }

  walk (callback) {
    return walk(this._tree, callback)
  }

  traverse (options) {
    return traverse(this._tree, options)
  }

  replace (options) {
    return replace(this._tree, options)
  }

  reduce (callback, accumulator) {
    return reduce(this._tree, callback, accumulator)
  }

  prepend (node) {
    return prepend(this._tree, node)
  }

  append (node) {
    return append(this._tree, node)
  }

  wrap (callback) {
    this._tree.body = callback(this._tree.body)
  }

  unwrap () {
    this._tree.body = first(this._tree, 'BlockStatement').body
  }

  mark () {
    return mark(this._tree)
  }
}

AbstractSyntaxTree.EmptyStatement = EmptyStatement
AbstractSyntaxTree.BlockStatement = BlockStatement
AbstractSyntaxTree.ExpressionStatement = ExpressionStatement
AbstractSyntaxTree.BinaryExpression = BinaryExpression
AbstractSyntaxTree.MemberExpression = MemberExpression
AbstractSyntaxTree.Literal = Literal
AbstractSyntaxTree.Identifier = Identifier
AbstractSyntaxTree.Program = Program
AbstractSyntaxTree.Function = Function
AbstractSyntaxTree.Node = Node
AbstractSyntaxTree.SourceLocation = SourceLocation
AbstractSyntaxTree.IfStatement = IfStatement

module.exports = AbstractSyntaxTree
