const { WILDCARD } = require('./find/enum')

function getValue (object, key) {
  if (typeof object[key] !== 'undefined') return object[key]

  key = ('' + key).split('.')
  for (let i = 0; i < key.length; i++) {
    object = object[key[i]]
    if (typeof object === 'undefined') return
  }
  return object
};

function isPlainObject (object) {
  return Object.prototype.toString.call(object) === '[object Object]'
}

function compare (node, criterias) {
  for (const key in criterias) {
    if (Object.prototype.hasOwnProperty.call(criterias, key)) {
      const value1 = getValue(node, key)
      const value2 = getValue(criterias, key)
      if ({}.toString.call(value2) === '[object RegExp]') {
        if (!value2.test(value1)) return false
      } else if (isPlainObject(value2)) {
        if (!compare(value1, value2)) return false
      } else if (Array.isArray(value2) && Array.isArray(value1)) {
        for (let i = value2.length - 1; i >= 0; i--) {
          if (value1.indexOf(value2[i]) < 0) return false
        }
      } else if (Array.isArray(value2)) {
        return false
      } else if (Array.isArray(value1)) {
        if (value1.indexOf(value2) < 0) return false
      } else {
        if (node[key] && value2 === WILDCARD) return true
        if (value1 !== value2) return false
      }
    }
  }

  return true
};

module.exports = function equal (node, criterias) {
  return compare(node, criterias)
}
