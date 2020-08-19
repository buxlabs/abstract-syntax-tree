const test = require('ava')
const { RegExpLiteral } = require('../..')

test('it sets a correct type', assert => {
  const node = new RegExpLiteral()
  assert.deepEqual(node.type, 'RegExpLiteral')
})
