/*
 * Based on:
 *
 * estemplate
 * https://github.com/RReverser/estemplate
 *
 * Copyright (c) 2014 Ingvar Stepanyan
 * Licensed under the MIT license.
 */

'use strict'

const parse = require('../parse')
const traverse = require('../traverse')
const replace = require('../replace')
const CODE_REGEXP = /([^\s,;]?)\s*?%(=?)\s*([\s\S]+?)\s*%\s*?([^\s,;]?)/g
const INTERNAL_VARIABLE_REGEXP = /^__ASTER_DATA_\d+$/
const INTERNAL_MARKER_REGEXP = /\"(__ASTER_DATA_\d+)\"/g
const BRACKETS = {
  '<': '>',
  '[': ']',
  '(': ')',
  '{': '}',
  "'": "'",
  '"': '"'
}
const SPREAD = {
  'ArrayExpression': 'elements',
  'CallExpression': 'arguments',
  'BlockStatement': 'body',
  'FunctionExpression': 'params',
  'FunctionDeclaration': 'params',
  'Program': 'body'
}

function template(string, options, data) {
  if (!data) {
    data = options
    options = undefined
  }
  return template.compile(string, options)(data)
}

function isInternalVariable(node) {
  return node.type === 'Identifier' && INTERNAL_VARIABLE_REGEXP.test(node.name)
}

function isInternalStatement(node) {
  return node.type === 'ExpressionStatement' && typeof node.expression === 'string'
}

template.modifyTree = function (ast) {
  traverse(ast, {
    leave (node, parent) {
      if (node.type !== '...') {
        return
      }
      var itemsKey = SPREAD[parent.type]
      if (!itemsKey) {
        throw new TypeError('Unknown substitution in ' + parent.type)
      }
      parent[itemsKey] = parent[itemsKey].reduce(function (items, item) {
        if (item.type === '...') {
          return items.concat(item.argument)
        }
        items.push(item)
        return items
      }, [])
    },
    keys: {
      '...': ['argument']
    }
  })
  return ast
}

template.compile = function (string, options) {
  var code = [],
    index = 0

  string = string.replace(CODE_REGEXP, function (match, open, isEval, codePart, close) {
    if (open) {
      var expectedClose = BRACKETS[open]
      if (!expectedClose || close && expectedClose !== close) {
        return match
      }
    }
    if (isEval) {
      var variableName = '__ASTER_DATA_' + (index++)
      var isSpread = open !== '<' && open !== "'" && open !== '"'
      if (isSpread) {
        codePart = '{type: "...", argument: ' + codePart + '}'
      } else if (open === "'" || open === '"') {
        codePart = '{type: "Literal", value: ' + codePart + '}'
      }
      code.push('\t\tvar ' + variableName + ' = ' + codePart)
      return isSpread ? (open + variableName + close) : variableName
    } else {
      if (open !== '<') {
        return match
      }
      code.push(codePart)
      return ''
    }
  })

  var tree = parse(string, options)

  replace(tree, {
    leave (node) {
      if (isInternalVariable(node)) {
        return node.name
      }

      if (isInternalStatement(node)) {
        return node.expression
      }
    }
  })

  if (!(options && options.fast)) {
    code.unshift('\twith (it) {')
    code.push('\t}')
  }

  code.unshift('return function template(it) {')

  code.push(
    '\treturn estemplate.modifyTree(' + JSON.stringify(tree).replace(INTERNAL_MARKER_REGEXP, '$1') + ')',
    '}'
  )

  return new Function('estemplate', code.join('\n'))(template)
}

module.exports = template
