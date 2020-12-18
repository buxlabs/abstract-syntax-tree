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
const match = require('./src/match')
const serialize = require('./src/serialize')
const sourcemap = require('./src/sourcemap')
const mark = require('./src/mark')
const program = require('./src/program')
const iife = require('./src/iife')

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

  static match (node, selector) {
    return match(node, selector)
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

  static program (body, options) {
    return program(body, options)
  }

  static iife (body) {
    return iife(body)
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

AbstractSyntaxTree.Node = require('./src/nodes/Node')
AbstractSyntaxTree.SourceLocation = require('./src/nodes/SourceLocation')
AbstractSyntaxTree.Position = require('./src/nodes/Position')
AbstractSyntaxTree.Identifier = require('./src/nodes/Identifier')
AbstractSyntaxTree.Literal = require('./src/nodes/Literal')
AbstractSyntaxTree.RegExpLiteral = require('./src/nodes/RegExpLiteral')
AbstractSyntaxTree.Program = require('./src/nodes/Program')
AbstractSyntaxTree.Function = require('./src/nodes/Function')
AbstractSyntaxTree.Statement = require('./src/nodes/Statement')
AbstractSyntaxTree.ExpressionStatement = require('./src/nodes/ExpressionStatement')
AbstractSyntaxTree.Directive = require('./src/nodes/Directive')
AbstractSyntaxTree.BlockStatement = require('./src/nodes/BlockStatement')
AbstractSyntaxTree.FunctionBody = require('./src/nodes/FunctionBody')
AbstractSyntaxTree.EmptyStatement = require('./src/nodes/EmptyStatement')
AbstractSyntaxTree.DebuggerStatement = require('./src/nodes/DebuggerStatement')
AbstractSyntaxTree.WithStatement = require('./src/nodes/WithStatement')
AbstractSyntaxTree.ReturnStatement = require('./src/nodes/ReturnStatement')
AbstractSyntaxTree.LabeledStatement = require('./src/nodes/LabeledStatement')
AbstractSyntaxTree.BreakStatement = require('./src/nodes/BreakStatement')
AbstractSyntaxTree.ContinueStatement = require('./src/nodes/ContinueStatement')
AbstractSyntaxTree.IfStatement = require('./src/nodes/IfStatement')
AbstractSyntaxTree.SwitchStatement = require('./src/nodes/SwitchStatement')
AbstractSyntaxTree.SwitchCase = require('./src/nodes/SwitchCase')
AbstractSyntaxTree.ThrowStatement = require('./src/nodes/ThrowStatement')
AbstractSyntaxTree.TryStatement = require('./src/nodes/TryStatement')
AbstractSyntaxTree.CatchClause = require('./src/nodes/CatchClause')
AbstractSyntaxTree.WhileStatement = require('./src/nodes/WhileStatement')
AbstractSyntaxTree.DoWhileStatement = require('./src/nodes/DoWhileStatement')
AbstractSyntaxTree.ForStatement = require('./src/nodes/ForStatement')
AbstractSyntaxTree.ForInStatement = require('./src/nodes/ForInStatement')
AbstractSyntaxTree.Declaration = require('./src/nodes/Declaration')
AbstractSyntaxTree.FunctionDeclaration = require('./src/nodes/FunctionDeclaration')
AbstractSyntaxTree.VariableDeclaration = require('./src/nodes/VariableDeclaration')
AbstractSyntaxTree.VariableDeclarator = require('./src/nodes/VariableDeclarator')
AbstractSyntaxTree.Expression = require('./src/nodes/Expression')
AbstractSyntaxTree.ThisExpression = require('./src/nodes/ThisExpression')
AbstractSyntaxTree.ArrayExpression = require('./src/nodes/ArrayExpression')
AbstractSyntaxTree.ObjectExpression = require('./src/nodes/ObjectExpression')
AbstractSyntaxTree.Property = require('./src/nodes/Property')
AbstractSyntaxTree.FunctionExpression = require('./src/nodes/FunctionExpression')
AbstractSyntaxTree.UnaryExpression = require('./src/nodes/UnaryExpression')
AbstractSyntaxTree.UnaryOperator = require('./src/nodes/UnaryOperator')
AbstractSyntaxTree.UpdateExpression = require('./src/nodes/UpdateExpression')
AbstractSyntaxTree.UpdateOperator = require('./src/nodes/UpdateOperator')
AbstractSyntaxTree.BinaryExpression = require('./src/nodes/BinaryExpression')
AbstractSyntaxTree.BinaryOperator = require('./src/nodes/BinaryOperator')
AbstractSyntaxTree.AssignmentExpression = require('./src/nodes/AssignmentExpression')
AbstractSyntaxTree.AssignmentOperator = require('./src/nodes/AssignmentOperator')
AbstractSyntaxTree.LogicalExpression = require('./src/nodes/LogicalExpression')
AbstractSyntaxTree.LogicalOperator = require('./src/nodes/LogicalOperator')
AbstractSyntaxTree.MemberExpression = require('./src/nodes/MemberExpression')
AbstractSyntaxTree.ConditionalExpression = require('./src/nodes/ConditionalExpression')
AbstractSyntaxTree.CallExpression = require('./src/nodes/CallExpression')
AbstractSyntaxTree.NewExpression = require('./src/nodes/NewExpression')
AbstractSyntaxTree.SequenceExpression = require('./src/nodes/SequenceExpression')
AbstractSyntaxTree.Pattern = require('./src/nodes/Pattern')
AbstractSyntaxTree.ForOfStatement = require('./src/nodes/ForOfStatement')
AbstractSyntaxTree.Super = require('./src/nodes/Super')
AbstractSyntaxTree.SpreadElement = require('./src/nodes/SpreadElement')
AbstractSyntaxTree.YieldExpression = require('./src/nodes/YieldExpression')
AbstractSyntaxTree.TemplateLiteral = require('./src/nodes/TemplateLiteral')
AbstractSyntaxTree.TaggedTemplateExpression = require('./src/nodes/TaggedTemplateExpression')
AbstractSyntaxTree.TemplateElement = require('./src/nodes/TemplateElement')
AbstractSyntaxTree.ObjectPattern = require('./src/nodes/ObjectPattern')
AbstractSyntaxTree.ArrayPattern = require('./src/nodes/ArrayPattern')
AbstractSyntaxTree.RestElement = require('./src/nodes/RestElement')
AbstractSyntaxTree.AssignmentPattern = require('./src/nodes/AssignmentPattern')
AbstractSyntaxTree.Class = require('./src/nodes/Class')
AbstractSyntaxTree.ClassBody = require('./src/nodes/ClassBody')
AbstractSyntaxTree.MethodDefinition = require('./src/nodes/MethodDefinition')
AbstractSyntaxTree.ClassDeclaration = require('./src/nodes/ClassDeclaration')
AbstractSyntaxTree.ClassExpression = require('./src/nodes/ClassExpression')
AbstractSyntaxTree.MetaProperty = require('./src/nodes/MetaProperty')
AbstractSyntaxTree.ModuleDeclaration = require('./src/nodes/ModuleDeclaration')
AbstractSyntaxTree.ModuleSpecifier = require('./src/nodes/ModuleSpecifier')
AbstractSyntaxTree.ImportDeclaration = require('./src/nodes/ImportDeclaration')
AbstractSyntaxTree.ImportSpecifier = require('./src/nodes/ImportSpecifier')
AbstractSyntaxTree.ImportDefaultSpecifier = require('./src/nodes/ImportDefaultSpecifier')
AbstractSyntaxTree.ImportNamespaceSpecifier = require('./src/nodes/ImportNamespaceSpecifier')
AbstractSyntaxTree.ExportNamedDeclaration = require('./src/nodes/ExportNamedDeclaration')
AbstractSyntaxTree.ExportSpecifier = require('./src/nodes/ExportSpecifier')
AbstractSyntaxTree.ExportDefaultDeclaration = require('./src/nodes/ExportDefaultDeclaration')
AbstractSyntaxTree.ExportAllDeclaration = require('./src/nodes/ExportAllDeclaration')
AbstractSyntaxTree.AwaitExpression = require('./src/nodes/AwaitExpression')
AbstractSyntaxTree.BigIntLiteral = require('./src/nodes/BigIntLiteral')
AbstractSyntaxTree.ChainExpression = require('./src/nodes/ChainExpression')
AbstractSyntaxTree.ChainElement = require('./src/nodes/ChainElement')
AbstractSyntaxTree.ImportExpression = require('./src/nodes/ImportExpression')

AbstractSyntaxTree.toBinaryExpression = require('./src/transform/toBinaryExpression')

AbstractSyntaxTree.binaryExpressionReduction = require('./src/optimize/binaryExpressionReduction')
AbstractSyntaxTree.ifStatementRemoval = require('./src/optimize/ifStatementRemoval')
AbstractSyntaxTree.logicalExpressionReduction = require('./src/optimize/logicalExpressionReduction')
AbstractSyntaxTree.memberExpressionReduction = require('./src/optimize/memberExpressionReduction')
AbstractSyntaxTree.negationOperatorRemoval = require('./src/optimize/negationOperatorRemoval')
AbstractSyntaxTree.ternaryOperatorReduction = require('./src/optimize/ternaryOperatorReduction')
AbstractSyntaxTree.typeofOperatorReduction = require('./src/optimize/typeofOperatorReduction')

module.exports = AbstractSyntaxTree
