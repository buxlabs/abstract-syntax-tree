// Type definitions for abstract-syntax-tree
// Project: https://github.com/buxlabs/abstract-syntax-tree
// Definitions by: GitHub Copilot

/**
 * Base AST Node interface following ESTree specification
 */
interface Node {
  type: string
  [key: string]: any
}

/**
 * Program node (root of AST)
 */
interface Program extends Node {
  type: 'Program'
  body: Node[]
  sourceType?: 'script' | 'module'
}

/**
 * Parse options from meriyah
 */
interface ParseOptions {
  /**
   * The flag to enable module syntax support
   */
  module?: boolean
  /**
   * The flag to enable location information in the AST
   */
  loc?: boolean
  /**
   * The flag to enable ranges in the AST
   */
  ranges?: boolean
  /**
   * The flag to enable JSX syntax support
   */
  jsx?: boolean
  /**
   * The flag to enable comments in the AST
   */
  onComment?: ((type: string, value: string, start: number, end: number) => void) | any[]
  /**
   * The flag to enable tokens in the AST
   */
  onToken?: ((token: any) => void) | any[]
  /**
   * The flag to enable experimental features
   */
  next?: boolean
  /**
   * The flag to enable directives
   */
  directives?: boolean
  /**
   * The flag to enable global return
   */
  globalReturn?: boolean
  /**
   * The flag to enable implied strict mode
   */
  impliedStrict?: boolean
  /**
   * Enable web compatibility
   */
  webcompat?: boolean
  /**
   * Preserve parens
   */
  preserveParens?: boolean
  /**
   * Lexical binding
   */
  lexical?: boolean
  /**
   * The flag to disable web compatibility
   */
  raw?: boolean
}

/**
 * Generate options
 */
interface GenerateOptions {
  /**
   * String to use for indentation (defaults to "  ")
   */
  indent?: string
  /**
   * String to use for line endings (defaults to "\n")
   */
  lineEnd?: string
  /**
   * Indent level to start from (defaults to 0)
   */
  startingIndentLevel?: number
  /**
   * Generate comments if true (defaults to false)
   */
  comments?: boolean
  /**
   * Custom code generator
   */
  generator?: any
  /**
   * Source map generator
   */
  sourceMap?: any
}

/**
 * Remove options
 */
interface RemoveOptions {
  /**
   * If true, only the first match will be removed
   */
  first?: boolean
}

/**
 * Traverse options
 */
interface TraverseOptions {
  /**
   * Callback invoked when entering a node
   */
  enter?: (node: Node, parent?: Node) => void
  /**
   * Callback invoked when leaving a node
   */
  leave?: (node: Node, parent?: Node) => void
}

/**
 * Template options
 */
interface TemplateOptions {
  [key: string]: any
}

/**
 * Walk callback
 */
type WalkCallback = (node: Node, parent?: Node) => void

/**
 * Replace callback
 */
type ReplaceCallback = (node: Node, parent?: Node) => Node | Node[] | null | void

/**
 * Reduce callback
 */
type ReduceCallback<T> = (accumulator: T, node: Node) => T

/**
 * Remove callback
 */
type RemoveCallback = (node: Node, parent?: Node) => Node | null

/**
 * Node selector - can be a string selector, object to match, or wildcard
 */
type Selector = string | Partial<Node> | '*'

/**
 * Abstract Syntax Tree class
 */
declare class AbstractSyntaxTree {
  /**
   * Parses source code into an AST
   */
  static parse(source: string, options?: ParseOptions): Program

  /**
   * Generates source code from an AST
   */
  static generate(tree: Node, options?: GenerateOptions): string

  /**
   * Finds nodes matching the selector
   */
  static find(tree: Node, selector: Selector): Node[]

  /**
   * Executes callback for each matching node
   */
  static each(tree: Node, selector: Selector, callback: WalkCallback): void

  /**
   * Finds the first node matching the selector
   */
  static first(tree: Node, selector: Selector): Node | undefined

  /**
   * Finds the last node matching the selector
   */
  static last(tree: Node, selector: Selector): Node | undefined

  /**
   * Counts nodes matching the selector
   */
  static count(tree: Node, selector: Selector): number

  /**
   * Checks if tree has nodes matching the selector
   */
  static has(tree: Node, selector: Selector): boolean

  /**
   * Removes nodes matching the target
   */
  static remove(tree: Node, target: Selector | RemoveCallback, options?: RemoveOptions): void

  /**
   * Prepends a node to the tree body
   */
  static prepend(tree: Node, node: Node | string): void

  /**
   * Appends a node to the tree body
   */
  static append(tree: Node, node: Node | string): void

  /**
   * Checks if two nodes are equal
   */
  static equal(node1: Node, node2: Node): boolean

  /**
   * Checks if node matches the selector
   */
  static match(node: Node, selector: Selector): boolean

  /**
   * Walks through all nodes in the tree
   */
  static walk(tree: Node, callback: WalkCallback): void

  /**
   * Traverses the tree with enter/leave callbacks
   */
  static traverse(tree: Node, options: TraverseOptions): void

  /**
   * Replaces nodes in the tree
   */
  static replace(tree: Node, callback: ReplaceCallback): void

  /**
   * Reduces the tree to a single value
   */
  static reduce<T>(tree: Node, callback: ReduceCallback<T>, accumulator: T): T

  /**
   * Serializes a node into a JavaScript value
   */
  static serialize(node: Node): any

  /**
   * Creates template nodes with placeholders
   */
  static template(source: string, options?: TemplateOptions): Node | Node[]

  /**
   * Creates a program node
   */
  static program(body: Node[], options?: ParseOptions): Program

  /**
   * Creates an IIFE (Immediately Invoked Function Expression)
   */
  static iife(body: Node[]): Node

  // Node constructors
  static Node: typeof NodeClass
  static SourceLocation: typeof SourceLocationClass
  static Position: typeof PositionClass
  static Identifier: typeof IdentifierClass
  static Literal: typeof LiteralClass
  static RegExpLiteral: typeof RegExpLiteralClass
  static Program: typeof ProgramClass
  static Function: typeof FunctionClass
  static Statement: typeof StatementClass
  static ExpressionStatement: typeof ExpressionStatementClass
  static Directive: typeof DirectiveClass
  static BlockStatement: typeof BlockStatementClass
  static FunctionBody: typeof FunctionBodyClass
  static EmptyStatement: typeof EmptyStatementClass
  static DebuggerStatement: typeof DebuggerStatementClass
  static WithStatement: typeof WithStatementClass
  static ReturnStatement: typeof ReturnStatementClass
  static LabeledStatement: typeof LabeledStatementClass
  static BreakStatement: typeof BreakStatementClass
  static ContinueStatement: typeof ContinueStatementClass
  static IfStatement: typeof IfStatementClass
  static SwitchStatement: typeof SwitchStatementClass
  static SwitchCase: typeof SwitchCaseClass
  static ThrowStatement: typeof ThrowStatementClass
  static TryStatement: typeof TryStatementClass
  static CatchClause: typeof CatchClauseClass
  static WhileStatement: typeof WhileStatementClass
  static DoWhileStatement: typeof DoWhileStatementClass
  static ForStatement: typeof ForStatementClass
  static ForInStatement: typeof ForInStatementClass
  static Declaration: typeof DeclarationClass
  static FunctionDeclaration: typeof FunctionDeclarationClass
  static VariableDeclaration: typeof VariableDeclarationClass
  static VariableDeclarator: typeof VariableDeclaratorClass
  static Expression: typeof ExpressionClass
  static ThisExpression: typeof ThisExpressionClass
  static ArrayExpression: typeof ArrayExpressionClass
  static ObjectExpression: typeof ObjectExpressionClass
  static Property: typeof PropertyClass
  static FunctionExpression: typeof FunctionExpressionClass
  static UnaryExpression: typeof UnaryExpressionClass
  static UnaryOperator: typeof UnaryOperatorClass
  static UpdateExpression: typeof UpdateExpressionClass
  static UpdateOperator: typeof UpdateOperatorClass
  static BinaryExpression: typeof BinaryExpressionClass
  static BinaryOperator: typeof BinaryOperatorClass
  static AssignmentExpression: typeof AssignmentExpressionClass
  static AssignmentOperator: typeof AssignmentOperatorClass
  static LogicalExpression: typeof LogicalExpressionClass
  static LogicalOperator: typeof LogicalOperatorClass
  static MemberExpression: typeof MemberExpressionClass
  static ConditionalExpression: typeof ConditionalExpressionClass
  static CallExpression: typeof CallExpressionClass
  static NewExpression: typeof NewExpressionClass
  static SequenceExpression: typeof SequenceExpressionClass
  static Pattern: typeof PatternClass
  static ForOfStatement: typeof ForOfStatementClass
  static Super: typeof SuperClass
  static SpreadElement: typeof SpreadElementClass
  static YieldExpression: typeof YieldExpressionClass
  static TemplateLiteral: typeof TemplateLiteralClass
  static TaggedTemplateExpression: typeof TaggedTemplateExpressionClass
  static TemplateElement: typeof TemplateElementClass
  static ObjectPattern: typeof ObjectPatternClass
  static ArrayPattern: typeof ArrayPatternClass
  static RestElement: typeof RestElementClass
  static AssignmentPattern: typeof AssignmentPatternClass
  static Class: typeof ClassClass
  static ClassBody: typeof ClassBodyClass
  static MethodDefinition: typeof MethodDefinitionClass
  static ClassDeclaration: typeof ClassDeclarationClass
  static ClassExpression: typeof ClassExpressionClass
  static MetaProperty: typeof MetaPropertyClass
  static ModuleDeclaration: typeof ModuleDeclarationClass
  static ModuleSpecifier: typeof ModuleSpecifierClass
  static ImportDeclaration: typeof ImportDeclarationClass
  static ImportSpecifier: typeof ImportSpecifierClass
  static ImportDefaultSpecifier: typeof ImportDefaultSpecifierClass
  static ImportNamespaceSpecifier: typeof ImportNamespaceSpecifierClass
  static ExportNamedDeclaration: typeof ExportNamedDeclarationClass
  static ExportSpecifier: typeof ExportSpecifierClass
  static ExportDefaultDeclaration: typeof ExportDefaultDeclarationClass
  static ExportAllDeclaration: typeof ExportAllDeclarationClass
  static AwaitExpression: typeof AwaitExpressionClass
  static BigIntLiteral: typeof BigIntLiteralClass
  static ChainExpression: typeof ChainExpressionClass
  static ChainElement: typeof ChainElementClass
  static ImportExpression: typeof ImportExpressionClass

  // Transform functions
  static toBinaryExpression: (node: Node) => Node

  // Optimization functions
  static binaryExpressionReduction: (tree: Node) => void
  static ifStatementRemoval: (tree: Node) => void
  static logicalExpressionReduction: (tree: Node) => void
  static memberExpressionReduction: (tree: Node) => void
  static negationOperatorRemoval: (tree: Node) => void
  static ternaryOperatorReduction: (tree: Node) => void
  static typeofOperatorReduction: (tree: Node) => void

  /**
   * The internal AST tree
   */
  private _tree: Program

  /**
   * Creates a new AbstractSyntaxTree instance
   * @param source Source code string or AST object
   * @param options Parse options
   */
  constructor(source?: string | Node, options?: ParseOptions)

  /**
   * Gets the type of the tree
   */
  get type(): string

  /**
   * Gets the body of the tree
   */
  get body(): Node[]

  /**
   * Sets the body of the tree
   */
  set body(body: Node[])

  /**
   * Gets the generated source code
   */
  get source(): string

  /**
   * Gets the source map
   */
  get map(): any

  /**
   * Finds nodes matching the selector
   */
  find(selector: Selector): Node[]

  /**
   * Executes callback for each matching node
   */
  each(selector: Selector, callback: WalkCallback): void

  /**
   * Finds the first node matching the selector
   */
  first(selector: Selector): Node | undefined

  /**
   * Finds the last node matching the selector
   */
  last(selector: Selector): Node | undefined

  /**
   * Counts nodes matching the selector
   */
  count(selector: Selector): number

  /**
   * Checks if tree has nodes matching the selector
   */
  has(selector: Selector): boolean

  /**
   * Removes nodes matching the target
   */
  remove(target: Selector | RemoveCallback, options?: RemoveOptions): void

  /**
   * Walks through all nodes in the tree
   */
  walk(callback: WalkCallback): void

  /**
   * Traverses the tree with enter/leave callbacks
   */
  traverse(options: TraverseOptions): void

  /**
   * Replaces nodes in the tree
   */
  replace(callback: ReplaceCallback): void

  /**
   * Reduces the tree to a single value
   */
  reduce<T>(callback: ReduceCallback<T>, accumulator: T): T

  /**
   * Prepends a node to the tree body
   */
  prepend(node: Node | string): void

  /**
   * Appends a node to the tree body
   */
  append(node: Node | string): void

  /**
   * Wraps the tree body with a callback
   */
  wrap(callback: (body: Node[]) => Node[]): void

  /**
   * Unwraps the tree body
   */
  unwrap(): void

  /**
   * Marks the tree
   */
  mark(): void
}

// Node class constructors
declare class NodeClass {
  type: string
  loc: any
  constructor(options?: any)
}

declare class SourceLocationClass {
  constructor(options?: any)
}

declare class PositionClass {
  constructor(options?: any)
}

declare class IdentifierClass {
  type: 'Identifier'
  name: string
  constructor(param: string | { name: string; [key: string]: any })
}

declare class LiteralClass {
  type: 'Literal'
  value: any
  raw?: string
  constructor(options?: any)
}

declare class RegExpLiteralClass {
  type: 'RegExpLiteral'
  pattern: string
  flags: string
  constructor(options?: any)
}

declare class ProgramClass {
  type: 'Program'
  body: Node[]
  constructor(options?: any)
}

declare class FunctionClass {
  constructor(options?: any)
}

declare class StatementClass {
  constructor(options?: any)
}

declare class ExpressionStatementClass {
  type: 'ExpressionStatement'
  expression: Node
  constructor(options?: any)
}

declare class DirectiveClass {
  constructor(options?: any)
}

declare class BlockStatementClass {
  type: 'BlockStatement'
  body: Node[]
  constructor(options?: any)
}

declare class FunctionBodyClass {
  constructor(options?: any)
}

declare class EmptyStatementClass {
  type: 'EmptyStatement'
  constructor(options?: any)
}

declare class DebuggerStatementClass {
  type: 'DebuggerStatement'
  constructor(options?: any)
}

declare class WithStatementClass {
  type: 'WithStatement'
  object: Node
  body: Node
  constructor(options?: any)
}

declare class ReturnStatementClass {
  type: 'ReturnStatement'
  argument: Node | null
  constructor(options?: any)
}

declare class LabeledStatementClass {
  type: 'LabeledStatement'
  label: Node
  body: Node
  constructor(options?: any)
}

declare class BreakStatementClass {
  type: 'BreakStatement'
  label: Node | null
  constructor(options?: any)
}

declare class ContinueStatementClass {
  type: 'ContinueStatement'
  label: Node | null
  constructor(options?: any)
}

declare class IfStatementClass {
  type: 'IfStatement'
  test: Node
  consequent: Node
  alternate: Node | null
  constructor(options?: any)
}

declare class SwitchStatementClass {
  type: 'SwitchStatement'
  discriminant: Node
  cases: Node[]
  constructor(options?: any)
}

declare class SwitchCaseClass {
  type: 'SwitchCase'
  test: Node | null
  consequent: Node[]
  constructor(options?: any)
}

declare class ThrowStatementClass {
  type: 'ThrowStatement'
  argument: Node
  constructor(options?: any)
}

declare class TryStatementClass {
  type: 'TryStatement'
  block: Node
  handler: Node | null
  finalizer: Node | null
  constructor(options?: any)
}

declare class CatchClauseClass {
  type: 'CatchClause'
  param: Node | null
  body: Node
  constructor(options?: any)
}

declare class WhileStatementClass {
  type: 'WhileStatement'
  test: Node
  body: Node
  constructor(options?: any)
}

declare class DoWhileStatementClass {
  type: 'DoWhileStatement'
  body: Node
  test: Node
  constructor(options?: any)
}

declare class ForStatementClass {
  type: 'ForStatement'
  init: Node | null
  test: Node | null
  update: Node | null
  body: Node
  constructor(options?: any)
}

declare class ForInStatementClass {
  type: 'ForInStatement'
  left: Node
  right: Node
  body: Node
  constructor(options?: any)
}

declare class DeclarationClass {
  constructor(options?: any)
}

declare class FunctionDeclarationClass {
  type: 'FunctionDeclaration'
  id: Node | null
  params: Node[]
  body: Node
  constructor(options?: any)
}

declare class VariableDeclarationClass {
  type: 'VariableDeclaration'
  declarations: Node[]
  kind: 'var' | 'let' | 'const'
  constructor(options?: any)
}

declare class VariableDeclaratorClass {
  type: 'VariableDeclarator'
  id: Node
  init: Node | null
  constructor(options?: any)
}

declare class ExpressionClass {
  constructor(options?: any)
}

declare class ThisExpressionClass {
  type: 'ThisExpression'
  constructor(options?: any)
}

declare class ArrayExpressionClass {
  type: 'ArrayExpression'
  elements: (Node | null)[]
  constructor(options?: any)
}

declare class ObjectExpressionClass {
  type: 'ObjectExpression'
  properties: Node[]
  constructor(options?: any)
}

declare class PropertyClass {
  type: 'Property'
  key: Node
  value: Node
  kind: 'init' | 'get' | 'set'
  constructor(options?: any)
}

declare class FunctionExpressionClass {
  type: 'FunctionExpression'
  id: Node | null
  params: Node[]
  body: Node
  constructor(options?: any)
}

declare class UnaryExpressionClass {
  type: 'UnaryExpression'
  operator: string
  argument: Node
  prefix: boolean
  constructor(options?: any)
}

declare class UnaryOperatorClass {
  constructor(options?: any)
}

declare class UpdateExpressionClass {
  type: 'UpdateExpression'
  operator: string
  argument: Node
  prefix: boolean
  constructor(options?: any)
}

declare class UpdateOperatorClass {
  constructor(options?: any)
}

declare class BinaryExpressionClass {
  type: 'BinaryExpression'
  operator: string
  left: Node
  right: Node
  constructor(options?: any)
}

declare class BinaryOperatorClass {
  constructor(options?: any)
}

declare class AssignmentExpressionClass {
  type: 'AssignmentExpression'
  operator: string
  left: Node
  right: Node
  constructor(options?: any)
}

declare class AssignmentOperatorClass {
  constructor(options?: any)
}

declare class LogicalExpressionClass {
  type: 'LogicalExpression'
  operator: string
  left: Node
  right: Node
  constructor(options?: any)
}

declare class LogicalOperatorClass {
  constructor(options?: any)
}

declare class MemberExpressionClass {
  type: 'MemberExpression'
  object: Node
  property: Node
  computed: boolean
  constructor(options?: any)
}

declare class ConditionalExpressionClass {
  type: 'ConditionalExpression'
  test: Node
  consequent: Node
  alternate: Node
  constructor(options?: any)
}

declare class CallExpressionClass {
  type: 'CallExpression'
  callee: Node
  arguments: Node[]
  constructor(options?: any)
}

declare class NewExpressionClass {
  type: 'NewExpression'
  callee: Node
  arguments: Node[]
  constructor(options?: any)
}

declare class SequenceExpressionClass {
  type: 'SequenceExpression'
  expressions: Node[]
  constructor(options?: any)
}

declare class PatternClass {
  constructor(options?: any)
}

declare class ForOfStatementClass {
  type: 'ForOfStatement'
  left: Node
  right: Node
  body: Node
  await: boolean
  constructor(options?: any)
}

declare class SuperClass {
  type: 'Super'
  constructor(options?: any)
}

declare class SpreadElementClass {
  type: 'SpreadElement'
  argument: Node
  constructor(options?: any)
}

declare class YieldExpressionClass {
  type: 'YieldExpression'
  argument: Node | null
  delegate: boolean
  constructor(options?: any)
}

declare class TemplateLiteralClass {
  type: 'TemplateLiteral'
  quasis: Node[]
  expressions: Node[]
  constructor(options?: any)
}

declare class TaggedTemplateExpressionClass {
  type: 'TaggedTemplateExpression'
  tag: Node
  quasi: Node
  constructor(options?: any)
}

declare class TemplateElementClass {
  type: 'TemplateElement'
  value: { raw: string; cooked?: string }
  tail: boolean
  constructor(options?: any)
}

declare class ObjectPatternClass {
  type: 'ObjectPattern'
  properties: Node[]
  constructor(options?: any)
}

declare class ArrayPatternClass {
  type: 'ArrayPattern'
  elements: (Node | null)[]
  constructor(options?: any)
}

declare class RestElementClass {
  type: 'RestElement'
  argument: Node
  constructor(options?: any)
}

declare class AssignmentPatternClass {
  type: 'AssignmentPattern'
  left: Node
  right: Node
  constructor(options?: any)
}

declare class ClassClass {
  constructor(options?: any)
}

declare class ClassBodyClass {
  type: 'ClassBody'
  body: Node[]
  constructor(options?: any)
}

declare class MethodDefinitionClass {
  type: 'MethodDefinition'
  key: Node
  value: Node
  kind: 'constructor' | 'method' | 'get' | 'set'
  computed: boolean
  static: boolean
  constructor(options?: any)
}

declare class ClassDeclarationClass {
  type: 'ClassDeclaration'
  id: Node | null
  superClass: Node | null
  body: Node
  constructor(options?: any)
}

declare class ClassExpressionClass {
  type: 'ClassExpression'
  id: Node | null
  superClass: Node | null
  body: Node
  constructor(options?: any)
}

declare class MetaPropertyClass {
  type: 'MetaProperty'
  meta: Node
  property: Node
  constructor(options?: any)
}

declare class ModuleDeclarationClass {
  constructor(options?: any)
}

declare class ModuleSpecifierClass {
  constructor(options?: any)
}

declare class ImportDeclarationClass {
  type: 'ImportDeclaration'
  specifiers: Node[]
  source: Node
  constructor(options?: any)
}

declare class ImportSpecifierClass {
  type: 'ImportSpecifier'
  imported: Node
  local: Node
  constructor(options?: any)
}

declare class ImportDefaultSpecifierClass {
  type: 'ImportDefaultSpecifier'
  local: Node
  constructor(options?: any)
}

declare class ImportNamespaceSpecifierClass {
  type: 'ImportNamespaceSpecifier'
  local: Node
  constructor(options?: any)
}

declare class ExportNamedDeclarationClass {
  type: 'ExportNamedDeclaration'
  declaration: Node | null
  specifiers: Node[]
  source: Node | null
  constructor(options?: any)
}

declare class ExportSpecifierClass {
  type: 'ExportSpecifier'
  exported: Node
  local: Node
  constructor(options?: any)
}

declare class ExportDefaultDeclarationClass {
  type: 'ExportDefaultDeclaration'
  declaration: Node
  constructor(options?: any)
}

declare class ExportAllDeclarationClass {
  type: 'ExportAllDeclaration'
  source: Node
  exported: Node | null
  constructor(options?: any)
}

declare class AwaitExpressionClass {
  type: 'AwaitExpression'
  argument: Node
  constructor(options?: any)
}

declare class BigIntLiteralClass {
  type: 'BigIntLiteral'
  value: string | bigint
  constructor(options?: any)
}

declare class ChainExpressionClass {
  type: 'ChainExpression'
  expression: Node
  constructor(options?: any)
}

declare class ChainElementClass {
  constructor(options?: any)
}

declare class ImportExpressionClass {
  type: 'ImportExpression'
  source: Node
  constructor(options?: any)
}

export = AbstractSyntaxTree
