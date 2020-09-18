const equal = require('./equal')

function buildNodeFromAttribute (selector) {
  const [start, end] = selector.split('=')
  const startIndex = start.startsWith('[') ? 1 : 0
  const endIndex = end.endsWith(']') ? end.length - 1 : end.length
  const key = start.substring(startIndex)
  const value = JSON.parse(end.substring(0, endIndex))
  return { [key]: value }
}

function buildNodeFromAttributes (selector) {
  const attributes = selector.split('][')
  return attributes.reduce((object, attribute) => {
    return { ...object, ...buildNodeFromAttribute(attribute) }
  }, {})
}

function buildComplexNode (selector) {
  const index = selector.indexOf('[')
  const type = selector.substring(0, index)
  const attribute = selector.substring(index, selector.length)
  return { type, ...buildNodeFromAttributes(attribute) }
}

function buildNode (selector) {
  if (selector.startsWith('[')) {
    return buildNodeFromAttributes(selector)
  } else if (selector.includes('[')) {
    return buildComplexNode(selector)
  }
  return { type: selector }
}

function match (node, selector) {
  if (typeof selector === 'string') {
    return equal(node, buildNode(selector))
  }
  return equal(node, selector)
}

module.exports = match
