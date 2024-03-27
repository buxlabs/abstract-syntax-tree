function tokenize(input) {
  const tokens = []
  let index = 0
  let start = 0

  while (index < input.length) {
    if (
      input[index] === "<" &&
      input[index + 1] === "%" &&
      input[index + 2] === "="
    ) {
      const value = input.slice(start, index)
      tokens.push({ type: "code", value })
      start = index + 3
      index += 3
    } else if (input[index] === "%" && input[index + 1] === ">") {
      const value = input.slice(start, index).trim()
      tokens.push({ type: "expression", value })
      start = index + 2
      index += 2
    }

    index++
  }

  if (start < input.length) {
    tokens.push({ type: "code", value: input.slice(start) })
  }

  return tokens
}

module.exports = tokenize
