const transform = require("./transform")
const parse = require("../parse")
const ArrayExpression = require("../nodes/ArrayExpression")
const Identifier = require("../nodes/Identifier")
const Literal = require("../nodes/Literal")
const UnaryExpression = require("../nodes/UnaryExpression")
// deprecated
const { builders } = require("ast-types")

const typedArrays = {
  Uint8Array: true,
  Int8Array: true,
  Uint8ClampedArray: true,
  Uint16Array: true,
  Int16Array: true,
  Uint32Array: true,
  Int32Array: true,
  Float32Array: true,
  Float64Array: true,
}

function toAST(obj) {
  if (typeof obj === "undefined") {
    return new UnaryExpression({
      operator: "void",
      argument: new Literal(0),
      prefix: true,
    })
  }

  if (typeof obj === "number") {
    if (isNaN(obj)) {
      return new Identifier("NaN")
    }

    if (obj === Infinity) {
      return new Identifier("Infinity")
    }

    if (obj < 0) {
      return new UnaryExpression({
        operator: "-",
        argument: new Literal(-obj),
        prefix: true,
      })
    }

    return new Literal(obj)
  }

  if (obj === null || typeof obj === "string" || typeof obj === "boolean") {
    return new Literal(obj)
  }

  if (typeof obj === "function") {
    const source = obj.toString()

    try {
      return parse("x = " + source).body[0].expression.right
    } catch (e) {
      return new Literal(null)
    }
  }

  if (Buffer.isBuffer(obj)) {
    return builders.newExpression(new Identifier("Buffer"), [
      new Literal(obj.toString("base64")),
      new Literal("base64"),
    ])
  }

  if (Array.isArray(obj)) {
    return new ArrayExpression(obj.map(toAST))
  }

  if (typeof obj === "object") {
    const type = Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1]

    if (type === "String" || type === "Number" || type === "Boolean") {
      return builders.newExpression(new Identifier(type), [
        toAST(obj.valueOf()),
      ])
    }

    if (type === "ArrayBuffer") {
      const buf = new Uint8Array(obj)

      let allZero = true
      for (let i = 0; i < buf.length; i++) {
        if (buf[i] !== 0) {
          allZero = false
          break
        }
      }

      if (allZero) {
        return builders.newExpression(new Identifier(type), [
          new Literal(obj.byteLength),
        ])
      }

      return builders.memberExpression(toAST(buf), new Identifier("buffer"))
    }

    if (typedArrays[type]) {
      return builders.newExpression(new Identifier(type), [
        new ArrayExpression(Array.prototype.slice.call(obj).map(toAST)),
      ])
    }

    if (type === "Date") {
      let d
      try {
        d = toAST(obj.toISOString())
      } catch (e) {
        d = toAST(NaN)
      }

      return builders.newExpression(new Identifier(type), [d])
    }

    if (type === "Error") {
      return builders.newExpression(new Identifier(obj.constructor.name), [
        toAST(obj.message),
      ])
    }

    if (type === "RegExp") {
      return new Literal(obj)
    }

    if (typeof obj.toAST === "function") {
      return obj.toAST()
    }

    const properties = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        properties.push(
          builders.property("init", new Literal(key), toAST(obj[key]))
        )
      }
    }

    return builders.objectExpression(properties)
  }

  throw new Error("Unsupported type to convert to AST")
}

module.exports = function template(source, options) {
  options = options || {}
  if (typeof source === "string") {
    return transform(source, options).body
  }
  return toAST(source, options)
}
