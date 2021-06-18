const test = require('ava')
const tokenize = require('./tokenize')

test('tokenize: works for attributes with values', async assert => {
  const tokens = tokenize('[name="foo"]')
  assert.deepEqual(tokens, [
    { type: 'attribute', key: 'name', value: '"foo"' }
  ])
})

test('tokenize: works for attributes without values', async assert => {
  const tokens = tokenize('[name]')
  assert.deepEqual(tokens, [
    { type: 'attribute', key: 'name', value: '' }
  ])
})
