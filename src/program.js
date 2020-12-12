module.exports = function program (body, options) {
  body = Array.isArray(body) ? body : [body].filter(Boolean)
  return {
    type: 'Program',
    sourceType: 'module',
    body,
    ...options
  }
}
