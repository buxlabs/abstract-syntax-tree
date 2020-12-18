// An IIFE (Immediately Invoked Function Expression)
// is a JavaScript function that runs as soon as it is defined.

module.exports = function iife (body) {
  body = Array.isArray(body) ? body : [body].filter(Boolean)
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body
        },
        async: false,
        generator: false
      },
      arguments: []
    }
  }
}
