const estraverse = require('estraverse')

function complexReplace (method, node, parent) {
  const replacement = method(node, parent)
  if (Array.isArray(replacement)) {
    parent.body = parent.body.reduce((result, leaf) => {
      return result.concat(node === leaf ? replacement : leaf)
    }, [])
  } else if (replacement) {
    return replacement
  } else if (replacement === null) {
    parent.body = parent.body.reduce((result, leaf) => {
      return result.concat(node === leaf ? null : leaf)
    }, []).filter(Boolean)
  }
}

module.exports = function replace (tree, options) {
  return estraverse.replace(tree, {
    enter (node, parent) {
      if (options.enter) {
        const replacement = complexReplace(options.enter, node, parent)
        if (replacement) { return replacement }
      }
    },
    leave (node, parent) {
      if (options.leave) {
        const replacement = complexReplace(options.leave, node, parent)
        if (replacement) { return replacement }
      }
    }
  })
}
