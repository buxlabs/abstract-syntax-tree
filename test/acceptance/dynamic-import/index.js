const test = require('ava')
const {
  generate,
  first,
  parse
} = require('../../..')

test('dynamic-import: can be parsed', assert => {
  const source = `
    import('foo.js')
      .then(function (bar) {
        bar.baz()
      })
  `
  const tree = parse(source)
  const node = first(tree, 'ImportExpression')
  assert.truthy(node)
})

test('dynamic-import: can be generated', assert => {
  const source = `
    import('foo.js')
      .then(function (bar) {
        bar.baz()
      })
  `
  const tree = parse(source)
  const output = generate(tree)
  assert.truthy(output.includes('import("foo.js").then('))
})
