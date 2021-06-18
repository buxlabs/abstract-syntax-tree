const test = require('ava')
const {
  generate,
  first,
  parse
} = require('../../..')

test('async-await: can be parsed and generated', assert => {
  const source = `
    async function foo () {}

    (async () => {
      await foo()
    })
  `
  const tree = parse(source)
  assert.truthy(first(tree, 'AwaitExpression'))
  assert.truthy(first(tree, '[async=true]'))
  const output = generate(tree)
  assert.truthy(output)
})
