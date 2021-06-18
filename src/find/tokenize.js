const START_ATTRIBUTE = '['
const END_ATTRIBUTE = ']'
const ASSIGNMENT = '='

module.exports = function tokenize (input) {
  const tokens = []
  const length = input.length
  let index = 0
  let character = input[0]
  function advance () {
    index += 1
    character = input[index]
    return character
  }
  function current (tag) {
    return character === tag
  }
  function push (type, { key, value }) {
    tokens.push({ type, key, value })
  }
  let type = 'string'
  let key = ''
  let value = ''
  while (index < length) {
    if (current(START_ATTRIBUTE)) {
      type = 'attribute'
      advance()
      key = ''
      value = ''
    } else if (current(ASSIGNMENT)) {
      key = value
      value = ''
      advance()
    } else if (current(END_ATTRIBUTE)) {
      if (!key) {
        key = value
        value = ''
      }
      push(type, { key, value })
      advance()
      key = ''
      value = ''
      type = 'string'
    } else {
      value += character
      advance()
    }
  }
  // push(type, { key, value })
  return tokens
}
