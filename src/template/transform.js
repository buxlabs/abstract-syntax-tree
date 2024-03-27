const parse = require("../parse")
const tokenize = require("./tokenize")
const generate = require("../generate")

function transform(string, data) {
  const tokens = tokenize(string)

  tokens.forEach((token) => {
    if (token.type === "expression") {
      const value = data[token.value]
      if (value) {
        token.type = "code"
        if (Array.isArray(value)) {
          token.value = value.map((node) => generate(node)).join(", ")
        } else if (typeof value === "object") {
          token.value = generate(value)
        } else {
          token.value = value
        }
      }
    }
  })

  const input = tokens.map((token) => token.value).join("")

  const tree = parse(input)
  return tree
}

module.exports = transform
