"use strict"

const parse = require("../parse")
// const traverse = require("../traverse")
// const replace = require("../replace")
const tokenize = require("./tokenize")
const generate = require("../generate")

function transform(string, data) {
  const tokens = tokenize(string)

  tokens.forEach((token) => {
    if (token.type === "expression") {
      if (data[token.value]) {
        token.type = "code"
        token.value = generate(data[token.value])
      }
    }
  })

  const input = tokens.map((token) => token.value).join("")

  const tree = parse(input)
  return tree
}

module.exports = transform
