const { isRegExp } = require("pure-conditions")

function isPrimitive(param) {
  return (
    typeof param === "string" ||
    typeof param === "number" ||
    typeof param === "boolean" ||
    param === null
  )
}

class Literal {
  constructor(param) {
    this.type = "Literal"
    if (isRegExp(param)) {
      this.value = {}
      this.regex = {
        pattern: param.source || "",
        flags: param.flags || "",
      }
    } else {
      const options = isPrimitive(param) ? { value: param } : param
      Object.assign(this, options)
    }
  }
}

module.exports = Literal
