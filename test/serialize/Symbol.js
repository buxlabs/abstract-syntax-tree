const test = require('ava')
const { serialize } = require('../..')

test('serialize: Symbol', assert => {
  assert.deepEqual(serialize({
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Symbol'
    },
    arguments: [
      { type: 'Literal', value: 42 }
    ]
  }).toString(), 'Symbol(42)')
})
