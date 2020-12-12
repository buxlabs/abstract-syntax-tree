const estemplate = require('./estemplate')
const { builders } = require('ast-types')
const parse = require('../parse')

const typedArrays = {
  Uint8Array: true,
  Int8Array: true,
  Uint8ClampedArray: true,
  Uint16Array: true,
  Int16Array: true,
  Uint32Array: true,
  Int32Array: true,
  Float32Array: true,
  Float64Array: true
}

function toAST (obj) {
  if (typeof obj === 'undefined') { return builders.unaryExpression('void', builders.literal(0)) }

  if (typeof obj === 'number') {
    if (isNaN(obj)) { return builders.identifier('NaN') }

    if (obj === Infinity) { return builders.identifier('Infinity') }

    if (obj < 0) { return builders.unaryExpression('-', builders.literal(-obj)) }

    return builders.literal(obj)
  }

  if (obj === null || typeof obj === 'string' || typeof obj === 'boolean') { return builders.literal(obj) }

  if (typeof obj === 'function') {
    const source = obj.toString()

    try {
      return parse('x = ' + source).body[0].expression.right
    } catch (e) {
      return builders.literal(null)
    }
  }

  if (Buffer.isBuffer(obj)) {
    return builders.newExpression(builders.identifier('Buffer'), [
      builders.literal(obj.toString('base64')),
      builders.literal('base64')
    ])
  }

  if (Array.isArray(obj)) { return builders.arrayExpression(obj.map(toAST)) }

  if (typeof obj === 'object') {
    const type = Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1]

    if (type === 'String' || type === 'Number' || type === 'Boolean') { return builders.newExpression(builders.identifier(type), [toAST(obj.valueOf())]) }

    if (type === 'ArrayBuffer') {
      const buf = new Uint8Array(obj)

      let allZero = true
      for (let i = 0; i < buf.length; i++) {
        if (buf[i] !== 0) {
          allZero = false
          break
        }
      }

      if (allZero) { return builders.newExpression(builders.identifier(type), [builders.literal(obj.byteLength)]) }

      return builders.memberExpression(toAST(buf), builders.identifier('buffer'))
    }

    if (typedArrays[type]) {
      return builders.newExpression(builders.identifier(type), [
        builders.arrayExpression(Array.prototype.slice.call(obj).map(toAST))
      ])
    }

    if (type === 'Date') {
      let d
      try {
        d = toAST(obj.toISOString())
      } catch (e) {
        d = toAST(NaN)
      }

      return builders.newExpression(builders.identifier(type), [d])
    }

    if (type === 'Error') { return builders.newExpression(builders.identifier(obj.constructor.name), [toAST(obj.message)]) }

    if (type === 'RegExp') { return builders.literal(obj) }

    if (typeof obj.toAST === 'function') { return obj.toAST() }

    const properties = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        properties.push(builders.property('init', builders.literal(key), toAST(obj[key])))
      }
    }

    return builders.objectExpression(properties)
  }

  throw new Error('Unsupported type to convert to AST')
}

module.exports = function template (source, options) {
  options = options || {}
  if (typeof source === 'string') {
    return estemplate(source, options).body
  }
  return toAST(source, options)
}
