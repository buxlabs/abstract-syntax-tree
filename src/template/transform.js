"use strict"

const parse = require("../parse")
// const traverse = require("../traverse")
// const replace = require("../replace")
const tokenize = require("./tokenize")

function transform(string) {
  const tokens = tokenize(string)

  tokens.forEach((token) => {
    if (token.type === "expression") {
      token.type = "code"
      token.value = "'bar'"
    }
  })

  const input = tokens.map((token) => token.value).join("")

  const tree = parse(input)
  return tree
}

module.exports = transform
