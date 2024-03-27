"use strict"

const parse = require("../parse")
// const traverse = require("../traverse")
// const replace = require("../replace")

function transform(string) {
  const tree = parse(string)
  return tree
}

module.exports = transform
