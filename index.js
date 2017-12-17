'use strict'

const espree = require('espree')
const esquery = require('esquery')
const escodegen = require('escodegen')
const estraverse = require('estraverse')
const template = require('estemplate')
const comparify = require('comparify')
const toAST = require('to-ast')
const prettier = require('prettier')

class AbstractSyntaxTree {
  constructor (source, options) {
    options = options || {}
    this.source = source
    this.ast = this.constructor.parse(source, {
      attachComment: options.comments,
      comment: options.comments,
      loc: true,
      sourceType: 'module'
    })
  }

  query (node, selector) {
    return esquery(node, selector)
  }

  find (selector, options) {
    return this.query(this.ast, selector, options)
  }

  each (selector, callback) {
    return this.find(selector).forEach(callback)
  }

  first (selector) {
    return this.find(selector)[0]
  }

  last (selector) {
    var nodes = this.find(selector)
    return nodes[nodes.length - 1]
  }

  count (selector) {
    return this.find(selector).length
  }

  has (selector) {
    return this.count(selector) > 0
  }

  is (node, expected) {
    return comparify(node, expected)
  }

  remove (target, options) {
    options = options || {}
    if (typeof target === 'string') {
      return this.removeBySelector(target, options)
    }
    this.removeByNode(target, options)
  }

  removeBySelector (target, options) {
    var nodes = this.find(target)
    // this could be improved by traversing once and
    // comparing the current node to the found nodes
    // one by one while making the array of nodes smaller too
    nodes.forEach(node => this.removeByNode(node, options))
  }

  removeByNode (node, options) {
    var count = 0
    estraverse.replace(this.ast, {
      enter: function (current, parent) {
        if (options.first && count === 1) {
          return this.break()
        }
        if (comparify(current, node)) {
          count += 1
          return this.remove()
        }
      },
      leave: function (current, parent) {
        if (current.expression === null ||
                  (current.type === 'VariableDeclaration' && current.declarations.length === 0)) {
          return this.remove()
        }
      }
    })
  }

  walk (callback) {
    return estraverse.traverse(this.ast, { enter: callback })
  }

  traverse (options) {
    return estraverse.traverse(this.ast, options)
  }

  replace (options) {
    return estraverse.replace(this.ast, options)
  }

  prepend (node) {
    this.ast.body.unshift(node)
  }

  append (node) {
    this.ast.body.push(node)
  }

  wrap (callback) {
    this.ast.body = callback(this.ast.body)
  }

  unwrap () {
    let block = this.first('BlockStatement')
    this.ast.body = block.body
  }

  template (source, options) {
    options = options || {}
    if (typeof source === 'string') {
      return template(source, options).body
    }
    return toAST(source, options)
  }

  beautify (source, options) {
    return prettier.format(source, options)
  }

  minify (ast) {
    return ast
  }

  toSource (options) {
    options = options || {}

    if (options.minify) {
      this.ast = this.minify(this.ast)
    }

    var source = escodegen.generate(this.ast, {
      comment: options.comments,
      format: {
        quotes: options.quotes || 'auto'
      }
    })

    if (options.beautify) {
      source = this.beautify(source, options.beautify)
    }

    var map
    if (options.sourceMap) {
      map = this.toSourceMap(options)
    }

    this.source = source

    if (map) { return { map, source } }
    return source
  }

  toSourceMap (options) {
    const source = this.source
    return escodegen.generate(this.ast, {
      sourceMap: options.sourceFile || 'UNKNOWN',
      sourceMapRoot: options.sourceRoot || '',
      sourceContent: source,
      comment: options.comments
    })
  }

  toString (options) {
    return this.toSource(options)
  }

  static parse (source, options) {
    return espree.parse(source, options)
  }
}

module.exports = AbstractSyntaxTree
