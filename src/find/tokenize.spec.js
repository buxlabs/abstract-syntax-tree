const test = require('ava')
const tokenize = require('./tokenize')

test('tokenize: returns an array of tokens', async assert => {
  const tokens = tokenize('[name="foo"]')
  assert.deepEqual(tokens, [
    { type: 'attribute', key: 'name', value: '"foo"' }
  ])
})
