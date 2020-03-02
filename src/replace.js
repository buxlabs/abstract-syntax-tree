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
  const enter = typeof options === 'function' ? options : options.enter
  const leave = options && options.leave
  return estraverse.replace(tree, {
    enter (node, parent) {
      if (enter) {
        const replacement = complexReplace(enter, node, parent)
        if (replacement) { return replacement }
      }
    },
    leave (node, parent) {
      if (leave) {
        const replacement = complexReplace(leave, node, parent)
        if (replacement) { return replacement }
      }
    }
  })
}
